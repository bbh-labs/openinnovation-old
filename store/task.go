package store

import (
	"database/sql"
	"strings"
	"time"

	"bbhoi.com/debug"
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

type CreateTaskParams struct {
	AuthorID int64
	ProjectID int64
	Title string
	Description string
	Done bool
	Tags string
	StartDate time.Time
	EndDate time.Time
}

func CreateTask(params CreateTaskParams) (int64, error) {
	const rawSQL = `
	INSERT INTO task (author_id, project_id, title, description, done,
					  tags, start_date, end_date, updated_at, created_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
	RETURNING id`

	var id int64
	if err := db.QueryRow(
			rawSQL,
			params.AuthorID,
			params.ProjectID,
			params.Title,
			params.Description,
			params.Done,
			params.Tags,
			params.StartDate,
			params.EndDate,
	).Scan(&id); err != nil {
		return 0, debug.Error(err)
	}

	return id, nil
}

type UpdateTaskParams struct {
	TaskID string
	Title string
	Description string
	Tags string
	StartDate string
	EndDate string
}

func UpdateTask(params UpdateTaskParams) error {
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
	taskID := parser.Int(params.TaskID)
	startDate := parser.Time(params.StartDate)
	endDate := parser.Time(params.EndDate)
	if parser.Err != nil {
		return debug.Error(parser.Err)
	}

	title := params.Title
	description := params.Description
	tags := params.Tags

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

func ToggleTaskStatus(taskID int64) error {
	const rawSQL = `UPDATE task SET done = not done WHERE id = $1`

	if _, err := db.Exec(rawSQL, taskID); err != nil {
		return debug.Error(err)
	}

	return nil
}

type DeleteTaskParams struct {
	UserID int64
	TaskID string
}

func DeleteTask(params DeleteTaskParams) error {
	var parser Parser

	const rawSQL = `DELETE FROM task WHERE id = $1`

	taskID := parser.Int(params.TaskID)
	if parser.Err != nil {
		return debug.Error(parser.Err)
	}

	if _, err := db.Exec(rawSQL, taskID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func GetTask(taskID int64) (Task, error) {
	var t task
	var err error

	const rawSQL = `
	SELECT * FROM task WHERE id = $1
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

	if t.Author, err = GetUser(t.AuthorID); err != nil {
		return nil, debug.Error(err)
	}

	t.TagsArray = strings.Split(t.Tags, ",")
	t.StartDateStr = t.StartDate.Format("02 Jan, 2006")
	t.EndDateStr = t.EndDate.Format("02 Jan, 2006")
	if t.Workers, err = GetWorkers(t.ID); err != nil {
		return nil, debug.Error(err)
	}

	return t, nil
}

func GetTasks(projectID int64) ([]Task, error) {
	const rawSQL = `
	SELECT * FROM task
	WHERE project_id = $1
	ORDER BY created_at DESC`

	return queryTasks(rawSQL, projectID)
}

func LatestTasks(title string, count int64) ([]Task, error) {
	const rawSQL = `
	SELECT * FROM task
	ORDER BY created_at DESC LIMIT $1`

	const rawSQL2 = `
	SELECT * FROM task
	WHERE title ~* $1
	ORDER BY created_at DESC LIMIT $2`

	if title != "" {
		title = ".*" + title + ".*"
		return queryTasks(rawSQL2, title, count)
	} else {
		return queryTasks(rawSQL, count)
	}
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

		if t.Author, err = GetUser(t.AuthorID); err != nil {
			return nil, debug.Error(err)
		}

		t.TagsArray = strings.Split(t.Tags, ",")
		t.StartDateStr = t.StartDate.Format("02 January, 2006")
		t.EndDateStr = t.EndDate.Format("02 January, 2006")
		if t.Workers, err = GetWorkers(t.ID); err != nil {
			return nil, debug.Error(err)
		}

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
