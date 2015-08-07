package store

import (
	"database/sql"
	"time"

	"github.com/bbhasiapacific/bbhoi.com/debug"
)

const createMilestoneSQL = `
id serial NOT NULL,
project_id int NOT NULL,
title text NOT NULL,
description text NOT NULL,
date timestamp NOT NULL,
updated_at timestamp NOT NULL,
created_at timestamp NOT NULL`

type Milestone interface{}

type milestone struct {
	ID_          int64     `json:"id"`
	ProjectID_   int64     `json:"projectID"`
	Title_       string    `json:"title"`
	Description_ string    `json:"description"`
	Date_        time.Time `json:"date"`
	UpdatedAt_   time.Time `json:"updatedAt"`
	CreatedAt_   time.Time `json:"createdAt"`

	DateStr      string    `json:"dateStr"`
}

func GetMilestone(milestoneID int64) (Milestone, error) {
	const rawSQL = `
	SELECT * FROM milestone
	WHERE id = $1`

	var m milestone
	if err := db.QueryRow(rawSQL, milestoneID).Scan(
		&m.ID_,
		&m.ProjectID_,
		&m.Title_,
		&m.Description_,
		&m.Date_,
		&m.UpdatedAt_,
		&m.CreatedAt_,
	); err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	m.DateStr = m.Date_.Format("02 January, 2006")

	return m, nil
}

func GetMilestones(projectID int64) ([]Milestone, error) {
	const rawSQL = `
	SELECT * FROM milestone
	WHERE project_id = $1
	ORDER BY date`

	return queryMilestones(rawSQL, projectID)
}

type CreateMilestoneParams struct {
	ProjectID   int64
	Title       string
	Description string
	Date        time.Time
}

func CreateMilestone(params CreateMilestoneParams) (int64, error) {
	const rawSQL = `
	INSERT INTO milestone (project_id, title, description, date, updated_at, created_at)
	VALUES ($1, $2, $3, $4, now(), now())
	RETURNING id`

	var id int64
	if err := db.QueryRow(
		rawSQL,
		params.ProjectID,
		params.Title,
		params.Description,
		params.Date,
	).Scan(&id); err != nil {
		return 0, debug.Error(err)
	}

	return id, nil
}

type UpdateMilestoneParams struct {
	MilestoneID int64
	Title       string
	Description string
	Date        time.Time
}

func UpdateMilestone(params UpdateMilestoneParams) error {
	const rawSQL = `
	UPDATE milestone SET title = $1, description = $2, date = $3
	WHERE id = $4`

	if _, err := db.Exec(
		rawSQL,
		params.Title,
		params.Description,
		params.Date,
		params.MilestoneID,
	); err != nil {
		return debug.Error(err)
	}

	return nil
}

func DeleteMilestone(milestoneID int64) error {
	const rawSQL = `
	DELETE FROM milestone WHERE id = $1`

	if _, err := db.Exec(rawSQL, milestoneID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func queryMilestones(rawSQL string, data ...interface{}) ([]Milestone, error) {
	rows, err := db.Query(rawSQL, data...)
	if err != nil {
		return nil, debug.Error(err)
	}
	defer rows.Close()

	var ms []Milestone
	for rows.Next() {
		var m milestone

		if err = rows.Scan(
			&m.ID_,
			&m.ProjectID_,
			&m.Title_,
			&m.Description_,
			&m.Date_,
			&m.UpdatedAt_,
			&m.CreatedAt_,
		); err != nil && err != sql.ErrNoRows {
			return nil, debug.Error(err)
		}
	
		m.DateStr = m.Date_.Format("02 January, 2006")

		ms = append(ms, m)
	}

	return ms, nil
}
