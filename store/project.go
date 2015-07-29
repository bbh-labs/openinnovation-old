package store

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"time"

	"bbhoi.com/debug"
	"bbhoi.com/formutil"
	"bbhoi.com/httputil"
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

const (
	Folder = `public`
	ProjectImageURL = `oi-content/project/%d/image`
)

type Project struct {
	ID          int64     `json:"id"`
	AuthorID    int64     `json:"authorID"`
	Title       string    `json:"title"`
	Tagline     string    `json:"tagline"`
	Description string    `json:"description"`
	ImageURL    string    `json:"imageURL"`
	ViewCount   int64     `json:"viewCount"`
	Status      string    `json:"status"`
	UpdatedAt   time.Time `json:"updatedAt"`
	CreatedAt   time.Time `json:"createdAt"`

	Author User   `json:"author"`
	Tasks  []Task `json:"tasks"`
}

func insertProject(params map[string]string) (int64, error) {
	const rawSQL = `
	INSERT INTO project (author_id, title, tagline, description, image_url, view_count, status, updated_at, created_at)
	VALUES ($1, $2, $3, $4, '', 0, 'concept', now(), now())
	RETURNING id`

	var parser Parser
	authorID := parser.Int(params["authorID"])
	if parser.Err != nil {
		return 0, debug.Error(parser.Err)
	}

	title := params["title"]
	tagline := params["tagline"]
	description := params["description"]

	var id int64
	if err := db.QueryRow(rawSQL, authorID, title, tagline, description).Scan(&id); err != nil {
		return 0, debug.Error(err)
	}

	return id, nil
}

func updateProject(params map[string]string) error {
	const rawSQL = `UPDATE project SET title = $1, tagline = $2, description = $3, updated_at = now() WHERE id = $4`
	
	var parser Parser
	projectID := parser.Int("projectID")
	if parser.Err != nil {
		return debug.Error(parser.Err)
	}

	title := params["title"]
	tagline := params["tagline"]
	description := params["description"]

	if _, err := db.Exec(rawSQL, title, tagline, description, projectID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func updateProjectTitle(projectID int64, title string) error {
	const rawSQL = `UPDATE project SET title = $1, updated_at = now() WHERE id = $2`

	if _, err := db.Exec(rawSQL, title, projectID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func updateProjectTagline(projectID int64, tagline string) error {
	const rawSQL = `UPDATE project SET tagline = $1, updated_at = now() WHERE id = $2`

	if _, err := db.Exec(rawSQL, tagline, projectID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func updateProjectDescription(projectID int64, description string) error {
	const rawSQL = `UPDATE project SET description = $1, updated_at = now() WHERE id = $2`

	if _, err := db.Exec(rawSQL, description, projectID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func saveProjectImage(w http.ResponseWriter, r *http.Request, projectID int64) (bool, error) {
	url := fmt.Sprintf(ProjectImageURL, projectID)

	os.Chdir(Folder)

	finalURL, header, err := httputil.SaveFileWithExtension(w, r, "image", url)
	if err != nil || header == nil {
		return false, nil
	}

	os.Chdir("..")

	if err := updateProjectImage(projectID, finalURL); err != nil {
		return false, debug.Error(err)
	}

	return true, nil
}

func updateProjectImage(projectID int64, imageURL string) error {
	const rawSQL = `UPDATE project SET image_url = $1 WHERE id = $2`

	if _, err := db.Exec(rawSQL, imageURL, projectID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func getProject(projectID int64) (Project, error) {
	var err error

	const rawSQL = `SELECT * FROM project WHERE id = $1`

	p := Project{}
	if err = db.QueryRow(rawSQL, projectID).Scan(
		&p.ID,
		&p.AuthorID,
		&p.Title,
		&p.Tagline,
		&p.Description,
		&p.ImageURL,
		&p.ViewCount,
		&p.Status,
		&p.UpdatedAt,
		&p.CreatedAt,
	); err != nil && err != sql.ErrNoRows {
		return p, debug.Error(err)
	}

	if p.Tasks, err = getTasks(projectID); err != nil {
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
	ORDER BY created_at DESC LIMIT $1`

	const rawSQL2 = `
	SELECT * FROM project
	WHERE title ~* $1
	ORDER BY created_at DESC LIMIT $2`

	count, err := formutil.Number(r, "count")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	var projects []Project

	title := r.FormValue("title")
	if title != "" {
		title = ".*" + title + ".*"
		projects, err = queryProjects(rawSQL2, title, count)
	} else {
		projects, err = queryProjects(rawSQL, count)
	}
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
			&p.Tagline,
			&p.Description,
			&p.ImageURL,
			&p.ViewCount,
			&p.Status,
			&p.UpdatedAt,
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
			&p.Tagline,
			&p.Description,
			&p.ImageURL,
			&p.ViewCount,
			&p.Status,
			&p.UpdatedAt,
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
	WHERE id = $1`

	var authorID int64
	if err := db.QueryRow(rawSQL, projectID).Scan(&authorID); err != nil {
		debug.Warn(err)
		return false
	}

	return authorID == userID
}

func GetProject(w http.ResponseWriter, r *http.Request) {
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
