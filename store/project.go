package store

import (
	"time"

	"bbhoi.com/debug"
)

const (
	createProjectSQL = `
	id serial PRIMARY KEY,
	author_id int NOT NULL,
	title text NOT NULL,
	tagline text NOT NULL,
	description text NOT NULL,
	image_url text NOT NULL,
	view_count int NOT NULL,
	status text NOT NULL,
	updated_at timestamp NOT NULL,
	created_at timestamp NOT NULL`
)

type Project struct {
	ID          int64     `json:"id,omitempty"`
	AuthorID    int64     `json:"authorID,omitempty"`
	Title       string    `json:"title,omitempty"`
	Description string    `json:"description,omitempty"`
	ImageURL    string    `json:"coverURL,omitempty"`
	ViewCount   int64     `json:"viewCount"`
	Status      string    `json:"status"`
	Recommended bool      `json:"recommended,omitempty"`
	CreatedAt   time.Time `json:"createdAt,omitempty"`

	Author     User        `json:"author"`
}

func insertProject(authorID int64, title, tagline, description string) (int64, error) {
	const q = `
	INSERT INTO project (author_id, title, tagline, description, image_url, view_count, status, updated_at, created_at)
	VALUES ($1, $2, $3, $4, '', 0, 'concept', now(), now()) RETURNING id`

	var id int64
	if err := db.QueryRow(q, authorID, title, tagline, description).Scan(&id); err != nil {
		return 0, debug.Error(err)
	}
	return id, nil
}

func updateProject(projectID int64, title, description string) error {
	const q = `UPDATE project SET title = $1, description = $2 WHERE id = $3`

	if _, err := db.Exec(q, title, description, projectID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func updateProjectImage(projectID int64, imageURL string) error {
	const q = `UPDATE project SET image_url = $1 WHERE id = $2`

	if _, err := db.Exec(q, imageURL, projectID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func getProject(projectID int64) (Project, error) {
	const q = `SELECT * FROM project WHERE id = ?`

	p := Project{}
	if err := db.QueryRow(q, projectID).Scan(
		&p.ID,
		&p.AuthorID,
		&p.Title,
		&p.Description,
		&p.ImageURL,
		&p.ViewCount,
		&p.Status,
		&p.Recommended,
		&p.CreatedAt,
	); err != nil {
		return p, debug.Error(err)
	}

	return p, nil
}

func GetMostViewedProjects(count int64) ([]Project, error) {
	const q = `SELECT * FROM project ORDER BY view_count DESC LIMIT ?`
	return queryProjects(q, count)
}

func SearchProjects(term string) ([]Project, error) {
	const q = `SELECT * FROM project WHERE title LIKE ?`
	return queryProjects(q, "%"+term+"%")
}

func StaffPickedProjects(count int64) ([]Project, error) {
	const q = `SELECT * FROM project WHERE recommended = 1 LIMIT ?`
	return queryProjects(q, count)
}

func TrendingProjects(count int64) ([]Project, error) {
	return GetMostViewedProjects(count)
}

func LatestProjects(count int64) ([]Project, error) {
	const q = `
	SELECT * FROM project
	ORDER BY createdAt DESC LIMIT ?`

	return queryProjectsWithMembers(q, count)
}

func CompletedProjects(count int64) ([]Project, error) {
	const q = `
	SELECT * FROM project
	WHERE status = 'completed'
	ORDER BY createdAt DESC LIMIT ?`

	return queryProjectsWithMembers(q, count)
}

func queryProjects(q string, data ...interface{}) ([]Project, error) {
	rows, err := db.Query(q, data...)
	if err != nil {
		return nil, debug.Error(err)
	}
	defer rows.Close()

	var ps []Project
	for rows.Next() {
		var p Project

		if err = rows.Scan(
			&p.ID,
			&p.AuthorID,
			&p.Title,
			&p.Description,
			&p.ImageURL,
			&p.ViewCount,
			&p.Status,
			&p.Recommended,
			&p.CreatedAt,
		); err != nil {
			return nil, debug.Error(err)
		}

		ps = append(ps, p)
	}

	return ps, nil
}

func queryProjectsWithMembers(q string, data ...interface{}) ([]Project, error) {
	rows, err := db.Query(q, data...)
	if err != nil {
		return nil, debug.Error(err)
	}
	defer rows.Close()

	var ps []Project
	for rows.Next() {
		var p Project

		if err = rows.Scan(
			&p.ID,
			&p.AuthorID,
			&p.Title,
			&p.Description,
			&p.ImageURL,
			&p.ViewCount,
			&p.Status,
			&p.Recommended,
			&p.CreatedAt,
		); err != nil {
			return nil, debug.Error(err)
		}

		ps = append(ps, p)
	}

	return ps, nil
}

func isAuthor(projectID, userID int64) bool {
	const q = `
	SELECT author_id FROM project
	WHERE project_id WHERE $1`

	var authorID int64
	if err := db.QueryRow(q, projectID).Scan(&authorID); err != nil {
		debug.Warn(err)
		return false
	}

	return authorID == userID
}
