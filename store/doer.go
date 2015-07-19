package store

import (
	"database/sql"
	"time"

	"bbhoi.com/debug"
)

const (
	createDoerSQL = `
    id serial PRIMARY KEY,
    taskID int NOT NULL,
    userID int NOT NULL,
    createdAt timestamp NOT NULL`
)

type Doer struct {
	ID        int64     `json:"id"`
	TaskID    int64     `json:"taskID"`
	UserID    int64     `json:"userID"`
	CreatedAt time.Time `json:"createdAt"`

	User User `json:"user"`
}

func InsertDoer(taskID, userID int64) (int64, error) {
	if hasDoer(taskID, userID) {
		return 0, nil
	}

	const q = `INSERT INTO doer (taskID, userID, createdAt)
               VALUES (?, ?, now())`

	res, err := db.Exec(q, taskID, userID)
	if err != nil {
		return 0, debug.Error(err)
	}

	return res.LastInsertId()
}

func DeleteDoer(taskID, userID int64) error {
	const q = `DELETE FROM doer WHERE taskID = ? AND userID = ?`

	if _, err := db.Exec(q, taskID, userID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func deleteAllDoers(projectID int64) error {
	const q = `DELETE FROM doer INNER JOIN task ON task.id = doer.taskID
			   WHERE task.sourceID = ?`

	if _, err := db.Exec(q, projectID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func ClearDoers(taskID int64) error {
	const q = `DELETE FROM doer WHERE taskID = ?`

	if _, err := db.Exec(q, taskID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func getDoers(taskID int64) ([]Doer, error) {
	const q = `SELECT * FROM doer
               INNER JOIN user_ ON user_.id = doer.userID
               WHERE doer.taskID = ?`

	var ds []Doer

	rows, err := db.Query(q, taskID)
	if err != nil {
		return nil, debug.Error(err)
	}
	defer rows.Close()

	for rows.Next() {
		var d Doer
		var u user

		if err = rows.Scan(
			&d.ID,
			&d.TaskID,
			&d.UserID,
			&d.CreatedAt,
			&u.ID_,
			&u.Email,
			&u.Password,
			&u.Title,
			&u.Description,
			&u.AvatarURL,
			&u.VerificationCode,
			&u.CreatedAt,
		); err != nil {
			return nil, debug.Error(err)
		}

		d.User = u

		ds = append(ds, d)
	}

	return ds, nil
}

func hasDoer(taskID, userID int64) bool {
	const q = `SELECT COUNT(*) FROM doer
			   WHERE doer.taskID = ? AND doer.userID = ?`

	var count int64
	if err := db.QueryRow(q, taskID, userID).Scan(&count); err != nil && err != sql.ErrNoRows {
		debug.Warn(err)
		return false
	}

	return count > 0
}
