package store

import (
	"database/sql"
	"time"

	"bbhoi.com/debug"
)

const (
	createCommentSQL = `
	id serial PRIMARY KEY,
	authorID int NOT NULL,
	sourceID int NOT NULL,
	sourceType text NOT NULL,
	text text NOT NULL,
	createdAt timestamp NOT NULL`

	insertCommentSQL = `
	INSERT INTO comment (authorID, sourceID, sourceType, text, createdAt)
	VALUES (?, ?, ?, ?, now())`

	getCommentSQL                  = `SELECT * FROM comment WHERE id = ? LIMIT 1`
	getCommentBySourceIDSQL        = `SELECT * FROM comment WHERE sourceID = ?`
	getCommentBySourceIDAndTypeSQL = `SELECT * FROM comment WHERE sourceID = ? AND sourceType = ?`
)

type Comment struct {
	ID         int64     `json:"id,omitempty"`
	AuthorID   int64     `json:"authorID,omitempty"`
	SourceID   int64     `json:"sourceID,omitempty"`
	SourceType string    `json:"sourceType,omitempty"`
	Text       string    `json:"text,omitempty"`
	CreatedAt  time.Time `json:"createdAt,omitempty"`

	User User `json:"user,omitempty"`
}

func getComment(id int64) (Comment, error) {
	var c Comment

	if err := error(db.QueryRow(getCommentSQL, id).Scan(
		&c.ID,
		&c.AuthorID,
		&c.SourceID,
		&c.SourceType,
		&c.Text,
		&c.CreatedAt,
	)); err != nil {
		if err == sql.ErrNoRows {
			return c, nil
		}
		return c, debug.Error(err)
	}

	return c, nil
}

func insertComment(userID, sourceID int64, sourceType, text string) error {
	if _, err := db.Exec(insertCommentSQL, userID, sourceID, sourceType, text); err != nil {
		return debug.Error(err)
	}
	return nil
}

func deleteAllComments(projectID int64) error {
	const q = `
	DELETE FROM comment WHERE sourceID = ?`

	if _, err := db.Exec(q, projectID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func GetComments(sourceID int64, sourceType string) []Comment {
	var rows *sql.Rows
	var err error

	if sourceType == "" {
		rows, err = db.Query(getCommentBySourceIDSQL, sourceID)
	} else {
		rows, err = db.Query(getCommentBySourceIDAndTypeSQL, sourceID, sourceType)
	}
	if err != nil {
		return nil
	}
	defer rows.Close()

	var cs []Comment
	for rows.Next() {
		var c Comment

		if err = rows.Scan(
			&c.ID,
			&c.AuthorID,
			&c.SourceID,
			&c.SourceType,
			&c.Text,
			&c.CreatedAt,
		); err != nil {
			debug.Warn(err)
			return nil
		}

		cs = append(cs, c)
	}

	return cs
}

func GetCommentsWithUser(sourceID int64, sourceType string) []Comment {
	var rows *sql.Rows
	var err error

	if sourceType == "" {
		rows, err = db.Query(getCommentBySourceIDSQL, sourceID)
	} else {
		rows, err = db.Query(getCommentBySourceIDAndTypeSQL, sourceID, sourceType)
	}
	if err != nil {
		return nil
	}
	defer rows.Close()

	var cs []Comment
	for rows.Next() {
		var c Comment

		if err = rows.Scan(
			&c.ID,
			&c.AuthorID,
			&c.SourceID,
			&c.SourceType,
			&c.Text,
			&c.CreatedAt,
		); err != nil {
			debug.Warn(err)
			return nil
		}

		c.User = GetUser(c.AuthorID)

		cs = append(cs, c)
	}

	return cs
}
