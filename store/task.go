package store

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	"bbhoi.com/debug"
	"bbhoi.com/formutil"
	"bbhoi.com/response"
)

const createTaskSQL = `
id serial NOT NULL,
author_id int NOT NULL,
project_id int NOT NULL,
title text NOT NULL,
description text NOT NULL,
done boolean NOT NULL,
tags text,
start_date timestamp NOT NULL,
end_date timestamp NOT NULL,
updated_at timestamp NOT NULL,
created_at timestamp NOT NULL`

type Task interface {}

type task struct {
	ID          int64       `json:"id"`
	AuthorID    int64       `json:"authorID"`
	ProjectID   int64       `json:"projectID"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Tags        string      `json:"tags"`
	Done        bool        `json:"done"`
	StartDate   time.Time   `json:"startDate"`
	EndDate     time.Time   `json:"endDate"`
	UpdatedAt   time.Time   `json:"updatedAt"`
	CreatedAt   time.Time   `json:"createdAt"`

	Author       User       `json:"author"`
	Workers      []User     `json:"workers"`
	TagsArray    []string   `json:"tagsArray"`
	StartDateStr string     `json:"startDateStr"`
	EndDateStr   string     `json:"endDateStr"`
}

type insertTaskParams struct {
	authorID int64
	projectID string
	title string
	description string
	done bool
	tags string
	startDate string
	endDate string
}

func insertTask(params insertTaskParams) (int64, error) {
	const rawSQL = `
	INSERT INTO task (author_id, project_id, title, description, done,
					  tags, start_date, end_date, updated_at, created_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
	RETURNING id`

	var parser Parser
	projectID := parser.Int(params.projectID)
	startDate := parser.Time(params.startDate)
	endDate := parser.Time(params.endDate)
	if parser.Err != nil {
		return 0, debug.Error(parser.Err)
	}

	authorID := params.authorID
	title := params.title
	description := params.description
	done := params.done
	tags := params.tags

	var id int64
	if err := db.QueryRow(
			rawSQL,
			authorID,
			projectID,
			title,
			description,
			done,
			tags,
			startDate,
			endDate,
	).Scan(&id); err != nil {
		return 0, debug.Error(err)
	}

	return id, nil
}

type updateTaskParams struct {
	taskID string
	title string
	description string
	tags string
	startDate string
	endDate string
}

func updateTask(params updateTaskParams) error {
	const rawSQL = `
	UPDATE task SET
			title = $1,
			description = $2,
			tags = $3,
			start_date = $4,
			end_date = $5,
			updated_at = now()
	WHERE id = $7`

	var parser Parser
	taskID := parser.Int(params.taskID)
	startDate := parser.Time(params.startDate)
	endDate := parser.Time(params.endDate)
	if parser.Err != nil {
		return debug.Error(parser.Err)
	}

	title := params.title
	description := params.description
	tags := params.tags

	if _, err := db.Exec(
			rawSQL,
			title,
			description,
			tags,
			startDate,
			endDate,
			taskID,
	); err != nil {
		return debug.Error(err)
	}

	return nil
}

func toggleTaskStatus(taskID int64) error {
	const rawSQL = `UPDATE task SET done = not done WHERE id = $1`

	if _, err := db.Exec(rawSQL, taskID); err != nil {
		return debug.Error(err)
	}

	return nil
}

type deleteTaskParams struct {
	userID int64
	taskID string
}

func deleteTask(params deleteTaskParams) error {
	var parser Parser

	const rawSQL = `DELETE FROM task WHERE id = $1`

	taskID := parser.Int(params.taskID)
	if parser.Err != nil {
		return debug.Error(parser.Err)
	}

	if _, err := db.Exec(rawSQL, taskID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func GetTask(w http.ResponseWriter, r *http.Request) {
	taskID, err := formutil.Number(r, "taskID")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	task, err := getTask(taskID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	if task == nil {
		response.ClientError(w, http.StatusNotFound)
		return
	}

	response.OK(w, task)
}

func getTask(taskID int64) (Task, error) {
	var t task
	var err error

	const rawSQL = `
	SELECT * FROM task
	ORDER BY created_at DESC LIMIT 1`

	if err = db.QueryRow(rawSQL, taskID).Scan(
			&t.ID,
			&t.AuthorID,
			&t.ProjectID,
			&t.Title,
			&t.Description,
			&t.Done,
			&t.Tags,
			&t.StartDate,
			&t.EndDate,
			&t.UpdatedAt,
			&t.CreatedAt,
	); err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	if t.Author, err = getUser(t.AuthorID); err != nil {
		return nil, debug.Error(err)
	}

	t.TagsArray = strings.Split(t.Tags, ",")
	t.StartDateStr = t.StartDate.Format("02 Jan, 2006")
	t.EndDateStr = t.EndDate.Format("02 Jan, 2006")

	return t, nil
}

func GetTasks(w http.ResponseWriter, r *http.Request) {
	var parser Parser

	projectID := parser.Int(r.FormValue("projectID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	tasks, err := getTasks(projectID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, tasks)
}

func getTasks(projectID int64) ([]Task, error) {
	const rawSQL = `
	SELECT * FROM task
	WHERE project_id = $1
	ORDER BY created_at DESC`

	return queryTasks(rawSQL, projectID)
}

func LatestTasks(w http.ResponseWriter, r *http.Request) {
	const rawSQL = `
	SELECT * FROM task
	ORDER BY created_at DESC LIMIT $1`

	const rawSQL2 = `
	SELECT * FROM task
	WHERE title ~* $1
	ORDER BY created_at DESC LIMIT $2`

	var parser Parser
	count := parser.Int(r.FormValue("count"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	var tasks []Task
	var err error

	title := r.FormValue("title")
	if title != "" {
		title = ".*" + title + ".*"
		tasks, err = queryTasks(rawSQL2, title, count)
	} else {
		tasks, err = queryTasks(rawSQL, count)
	}
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, tasks)
}

func queryTasks(rawSQL string, data ...interface{}) ([]Task, error) {
	rows, err := db.Query(rawSQL, data...)
	if err != nil {
		return nil, debug.Error(err)
	}
	defer rows.Close()

	var ts []Task
	for rows.Next() {
		var t task

		if err = rows.Scan(
			&t.ID,
			&t.AuthorID,
			&t.ProjectID,
			&t.Title,
			&t.Description,
			&t.Done,
			&t.Tags,
			&t.StartDate,
			&t.EndDate,
			&t.UpdatedAt,
			&t.CreatedAt,
		); err != nil && err != sql.ErrNoRows {
			return nil, debug.Error(err)
		}

		if t.Author, err = getUser(t.AuthorID); err != nil {
			return nil, debug.Error(err)
		}

		t.TagsArray = strings.Split(t.Tags, ",")
		t.StartDateStr = t.StartDate.Format("02 January, 2006")
		t.EndDateStr = t.EndDate.Format("02 January, 2006")

		ts = append(ts, t)
	}

	return ts, nil
}

func projectIDFromTask(taskID int64) (int64, error) {
	const rawSQL = `
	SELECT project_id FROM task WHERE id = $1`

	var projectID int64
	if err := db.QueryRow(rawSQL, taskID).Scan(&projectID); err != nil {
		if err == sql.ErrNoRows {
			return 0, nil
		}
		return 0, debug.Error(err)
	}

	return projectID, nil
}
