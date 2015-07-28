package store

import (
	"bbhoi.com/debug"
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
