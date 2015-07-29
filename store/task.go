package store

import (
	"database/sql"
	"net/http"
	"time"

	"bbhoi.com/debug"
	"bbhoi.com/formutil"
	"bbhoi.com/response"
)

const createTaskSQL = `
id serial NOT NULL,
author_id int NOT NULL,
project_id int NOT NULL,
parent_id int NOT NULL,
title text NOT NULL,
description text NOT NULL,
status text NOT NULL,
tags text[],
start_date timestamp NOT NULL,
end_date timestamp NOT NULL,
updated_at timestamp NOT NULL,
created_at timestamp NOT NULL`

type Task interface {}

type task struct {
	ID          int64     `json:"id"`
	AuthorID    int64     `json:"authorID"`
	ProjectID   int64     `json:"projectID"`
	ParentID    int64     `json:"parentID"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	Tags        []byte    `json:"tags"`
	StartDate   time.Time `json:"startDate"`
	EndDate     time.Time `json:"endDate"`
	UpdatedAt   time.Time `json:"updatedAt"`
	CreatedAt   time.Time `json:"createdAt"`

	Author     User       `json:"author"`
}

func insertTask(params map[string]string) (int64, error) {
	const rawSQL = `
	INSERT INTO task (author_id, project_id, parent_id, title, tagline
	                  description, status, tags, start_date, end_date,
					  updated_at, created_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())
	RETURNING id`

	var parser Parser
	authorID := parser.Int(params["authorID"])
	projectID := parser.Int(params["projectID"])
	parentID := parser.Int(params["parentID"])
	if parser.Err != nil {
		return 0, debug.Error(parser.Err)
	}

	startDate := parser.Time(params["start_date"])
	endDate := parser.Time(params["end_date"])
	if parser.Err != nil {
		return 0, debug.Error(parser.Err)
	}

	title := params["title"]
	tagline := params["tagline"]
	description := params["description"]

	var id int64
	if err := db.QueryRow(
			rawSQL,
			authorID,
			projectID,
			parentID,
			title,
			tagline,
			description,
			startDate,
			endDate,
	).Scan(&id); err != nil {
		return 0, debug.Error(err)
	}

	return id, nil
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
	const rawSQL = `
	SELECT * FROM task
	ORDER BY created_at DESC LIMIT 1`

	var t task
	if err := db.QueryRow(rawSQL, taskID).Scan(&t); err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	return t, nil
}

func LatestTasks(w http.ResponseWriter, r *http.Request) {
	const rawSQL = `
	SELECT * FROM task
	WHERE project_id = $1
	ORDER BY created_at DESC LIMIT $2`

	const rawSQL2 = `
	SELECT * FROM task
	WHERE project_id = $1 AND title ~* $2
	ORDER BY created_at DESC LIMIT $3`

	var parser Parser
	projectID := parser.Int(r.FormValue("projectID"))
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
		tasks, err = queryTasks(rawSQL2, projectID, title, count)
	} else {
		tasks, err = queryTasks(rawSQL, projectID, count)
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
			&t.ParentID,
			&t.Title,
			&t.Description,
			&t.Status,
			&t.Tags,
			&t.StartDate,
			&t.EndDate,
			&t.UpdatedAt,
			&t.CreatedAt,
		); err != nil {
			return nil, debug.Error(err)
		}

		if t.Author, err = getUser(t.AuthorID); err != nil {
			return nil, debug.Error(err)
		}

		ts = append(ts, t)
	}

	return ts, nil
}
