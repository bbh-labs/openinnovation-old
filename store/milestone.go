package store

import (
	"net/http"
	"time"

	"bbhoi.com/debug"
)

const (
	createMilestoneSQL = `
	id serial PRIMARY KEY,
	sourceID int NOT NULL,
	title text NOT NULL,
	description text NOT NULL,
	deadline timestamp NOT NULL,
	createdAt timestamp NOT NULL`
)

type Milestone struct {
	ID          int64     `json:"id"`
	SourceID    int64     `json:"sourceID"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Deadline    time.Time `json:"deadline"`
	CreatedAt   time.Time `json:"createdAt"`
}

func InsertMilestones(sourceID int64, r *http.Request) error {
	mTitles := r.MultipartForm.Value["milestoneTitle"]
	mDescriptions := r.MultipartForm.Value["milestoneDescription"]
	mDeadlines := r.MultipartForm.Value["milestoneDeadline"]

	for i, v := range mTitles {
		InsertMilestone(sourceID, v, mDescriptions[i], mDeadlines[i])
	}

	return nil
}

func InsertMilestone(sourceID int64, title, description, deadlineStr string) error {
	const q = `
	INSERT INTO milestone (sourceID, title, description, deadline, createdAt)
	VALUES (?, ?, ?, ?, now())`

	deadline, err := time.Parse("01/02/2006", deadlineStr)
	if err != nil {
		return debug.Error(err)
	}

	if _, err := db.Exec(q, sourceID, title, description, deadline); err != nil {
		return debug.Error(err)
	}

	return nil
}

func UpdateMilestone(milestoneID int64, title, description, deadlineStr string) error {
	const q = `UPDATE milestone SET title = ?, description = ?, deadline = ? WHERE id = ?`

	deadline, err := time.Parse("01/02/2006", deadlineStr)
	if err != nil {
		return debug.Error(err)
	}

	if _, err := db.Exec(q, title, description, deadline, milestoneID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func DeleteMilestone(milestoneID int64) error {
	const q = `DELETE FROM milestone WHERE id = ?`

	if _, err := db.Exec(q, milestoneID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func deleteAllMilestones(projectID int64) error {
	const q = `DELETE FROM milestone WHERE sourceID = ?`

	if _, err := db.Exec(q, projectID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func GetMilestones(sourceID int64) []Milestone {
	const q = `SELECT * FROM milestone WHERE sourceID = ?`
	return queryMilestone(q, sourceID)
}

func queryMilestone(q string, data ...interface{}) []Milestone {
	rows, err := db.Query(q, data...)
	if err != nil {
		debug.Warn(err)
		return nil
	}
	defer rows.Close()

	var ms []Milestone

	for rows.Next() {
		var m Milestone
		if err = rows.Scan(
			&m.ID,
			&m.SourceID,
			&m.Title,
			&m.Description,
			&m.Deadline,
			&m.CreatedAt,
		); err != nil {
			debug.Warn(err)
			return nil
		}

		ms = append(ms, m)
	}

	return ms
}
