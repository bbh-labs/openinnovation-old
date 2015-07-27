package store

import (
	"net/http"
	"time"

	"bbhoi.com/debug"
	"bbhoi.com/formutil"
	"bbhoi.com/response"
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
	const rawSQL = `
	INSERT INTO project (author_id, title, tagline, description, image_url, view_count, status, updated_at, created_at)
	VALUES ($1, $2, $3, $4, '', 0, 'concept', now(), now()) RETURNING id`

	var id int64
	if err := db.QueryRow(rawSQL, authorID, title, tagline, description).Scan(&id); err != nil {
		return 0, debug.Error(err)
	}
	return id, nil
}

func updateProject(projectID int64, title, description string) error {
	const rawSQL = `UPDATE project SET title = $1, description = $2 WHERE id = $3`

	if _, err := db.Exec(rawSQL, title, description, projectID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func updateProjectImage(projectID int64, imageURL string) error {
	const rawSQL = `UPDATE project SET image_url = $1 WHERE id = $2`

	if _, err := db.Exec(rawSQL, imageURL, projectID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func getProject(projectID int64) (Project, error) {
	const rawSQL = `SELECT * FROM project WHERE id = ?`

	p := Project{}
	if err := db.QueryRow(rawSQL, projectID).Scan(
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
	const rawSQL = `SELECT * FROM project ORDER BY view_count DESC LIMIT ?`
	return queryProjects(rawSQL, count)
}

func SearchProjects(term string) ([]Project, error) {
	const rawSQL = `SELECT * FROM project WHERE title LIKE ?`
	return queryProjects(rawSQL, "%"+term+"%")
}

func TrendingProjects(count int64) ([]Project, error) {
	return GetMostViewedProjects(count)
}

func LatestProjects(w http.ResponseWriter, r *http.Request) {
	const rawSQL = `
	SELECT * FROM project
	ORDER BY createdAt DESC LIMIT $1`

	var count int64
	var err error

	if count, err = formutil.Number(r, "count"); err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	projects, err :=  queryProjects(rawSQL, count)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, projects)
}

func CompletedProjects(count int64) ([]Project, error) {
	const rawSQL = `
	SELECT * FROM project
	WHERE status = 'completed'
	ORDER BY createdAt DESC LIMIT ?`

	return queryProjectsWithMembers(rawSQL, count)
}

func queryProjects(rawSQL string, data ...interface{}) ([]Project, error) {
	rows, err := db.Query(rawSQL, data...)
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

func queryProjectsWithMembers(rawSQL string, data ...interface{}) ([]Project, error) {
	rows, err := db.Query(rawSQL, data...)
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
	const rawSQL = `
	SELECT author_id FROM project
	WHERE project_id WHERE $1`

	var authorID int64
	if err := db.QueryRow(rawSQL, projectID).Scan(&authorID); err != nil {
		debug.Warn(err)
		return false
	}

	return authorID == userID
}

func GetCompleteProject(w http.ResponseWriter, r *http.Request) {
	projectID, err := formutil.Number(r, "projectID")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	p, err := getProject(projectID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	if p.Author, err = GetUserByID(p.AuthorID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, p)
}

func SetFeaturedProject(w http.ResponseWriter, r *http.Request) {
	const existSQL = `
	SELECT COUNT(*) FROM featured_project
	WHERE project_id = $1`

	projectID, err := formutil.Number(r, "projectID")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if exists(existSQL, projectID) {
		response.OK(w, nil)
		return
	}

	const rawSQL = `
	INSERT INTO featured_project (project_id, created_at) VALUES ($1, now())`

	if _, err := db.Exec(rawSQL, projectID); err != nil {
		response.ServerError(w, err)
	}
}

func UnsetFeaturedProject(w http.ResponseWriter, r *http.Request) {
	const rawSQL = `
	DELETE FROM featured_project WHERE project_id = $1`

	projectID, err := formutil.Number(r, "projectID")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if _, err := db.Exec(rawSQL, projectID); err != nil {
		response.ServerError(w, err)
	}
}
