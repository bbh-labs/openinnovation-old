package store

import (
	"database/sql"
	"fmt"
	"net/http"
	"path"
	"os"
	"time"

	"github.com/bbhmakerlab/openinnovation/debug"
	"github.com/bbhmakerlab/openinnovation/httputil"
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
	ProjectImageURL = `Content/project/%d/image`
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

	Author     User        `json:"author"`
	Tasks      []Task      `json:"tasks"`
	Milestones []Milestone `json:"milestones"`
	Members    []User      `json:"members"`
	IsMember   bool        `json:"isMember"`
}

func CreateProject(params map[string]string) (int64, error) {
	const rawSQL = `
	INSERT INTO project (author_id, title, tagline, description, image_url, view_count, status, updated_at, created_at)
	VALUES ($1, $2, $3, $4, '', 0, 'concept', now(), now())
	RETURNING id`

	var parser Parser
	authorID := parser.Int(params["authorID"])
	if parser.Err != nil {
		debug.Error(parser.Err)
		return 0, parser.Err
	}

	title := params["title"]
	tagline := params["tagline"]
	description := params["description"]

	var id int64
	if err := db.QueryRow(rawSQL, authorID, title, tagline, description).Scan(&id); err != nil {
		debug.Error(err)
		return 0, err
	}

	return id, nil
}

func UpdateProjectTitle(projectID int64, title string) error {
	const rawSQL = `UPDATE project SET title = $1, updated_at = now() WHERE id = $2`

	if _, err := db.Exec(rawSQL, title, projectID); err != nil {
		debug.Error(err)
		return err
	}

	return nil
}

func UpdateProjectTagline(projectID int64, tagline string) error {
	const rawSQL = `UPDATE project SET tagline = $1, updated_at = now() WHERE id = $2`

	if _, err := db.Exec(rawSQL, tagline, projectID); err != nil {
		debug.Error(err)
		return err
	}

	return nil
}

func UpdateProjectDescription(projectID int64, description string) error {
	const rawSQL = `UPDATE project SET description = $1, updated_at = now() WHERE id = $2`

	if _, err := db.Exec(rawSQL, description, projectID); err != nil {
		debug.Error(err)
		return err
	}

	return nil
}

func SaveProjectImage(w http.ResponseWriter, r *http.Request, projectID int64) (bool, error) {
	url := fmt.Sprintf(ProjectImageURL, projectID)

	finalURL, header, err := httputil.SaveFileWithExtension(w, r, "image", url)
	if err != nil || header == nil {
		if err := os.Chdir(".."); err != nil {
			debug.Error(err)
			return false, err
		}
		return false, nil
	}

	if err := updateProjectImage(projectID, finalURL); err != nil {
		debug.Error(err)
		return false, err
	}

	return true, nil
}

func updateProjectImage(projectID int64, imageURL string) error {
	const rawSQL = `UPDATE project SET image_url = $1 WHERE id = $2`

	if _, err := db.Exec(rawSQL, imageURL, projectID); err != nil {
		debug.Error(err)
		return err
	}
	return nil
}

func GetProject(projectID int64) (Project, error) {
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
		debug.Error(err)
		return p, err
	}

	if p.Tasks, err = GetTasks(projectID); err != nil {
		debug.Error(err)
		return p, err
	}

	if p.Milestones, err = GetMilestones(projectID); err != nil {
		debug.Error(err)
		return p, err
	}

	if p.Members, err = GetMembers(projectID); err != nil {
		debug.Error(err)
		return p, err
	}

	return p, nil
}

func DeleteProject(projectID int64) error {
	const rawSQL = `DELETE FROM project WHERE id = $1`

	// delete project
	if _, err := db.Exec(rawSQL, projectID); err != nil {
		debug.Error(err)
		return err
	}

	const rawSQL2 = `DELETE FROM member WHERE project_id = $1`

	// delete project users
	if _, err := db.Exec(rawSQL2, projectID); err != nil {
		debug.Error(err)
		return err
	}

	// delete project image
	if err := os.RemoveAll(fmt.Sprintf(path.Base(ProjectImageURL), projectID)); err != nil {
		debug.Error(err)
		return err
	}

	return nil
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

func LatestProjects(title string, count int64) ([]Project, error) {
	const rawSQL = `
	SELECT * FROM project
	ORDER BY created_at DESC LIMIT $1`

	const rawSQL2 = `
	SELECT * FROM project
	WHERE title ~* $1
	ORDER BY created_at DESC LIMIT $2`

	if title != "" {
		title = ".*" + title + ".*"
		return queryProjects(rawSQL2, title, count)
	} else {
		return queryProjects(rawSQL, count)
	}
}

func queryProjects(rawSQL string, data ...interface{}) ([]Project, error) {
	rows, err := db.Query(rawSQL, data...)
	if err != nil {
		debug.Error(err)
		return nil, err
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
			debug.Error(err)
			return nil, err
		}

		if p.Tasks, err = GetTasks(p.ID); err != nil {
			debug.Error(err)
			return ps, err
		}

		if p.Milestones, err = GetMilestones(p.ID); err != nil {
			debug.Error(err)
			return ps, err
		}

		if p.Members, err = GetMembers(p.ID); err != nil {
			debug.Error(err)
			return ps, err
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
		debug.Error(err)
		return false
	}

	return authorID == userID
}

func IsMember(projectID, userID int64) bool {
	const rawSQL = `
	SELECT COUNT(*) FROM member
	WHERE project_id = $1 AND user_id = $2`

	var count int64
	if err := db.QueryRow(rawSQL, projectID, userID).Scan(&count); err != nil {
		if err != sql.ErrNoRows {
			debug.Error(err)
		}
		return false
	}

	return count > 0
}

func SetFeaturedProject(projectID int64) error {
	const rawSQL = `
	INSERT INTO featured_project (project_id, created_at) VALUES ($1, now())`

	if _, err := db.Exec(rawSQL, projectID); err != nil {
		debug.Error(err)
		return err
	}

	return nil
}

func UnsetFeaturedProject(projectID int64) error {
	const rawSQL = `
	DELETE FROM featured_project WHERE project_id = $1`

	if _, err := db.Exec(rawSQL, projectID); err != nil {
		debug.Error(err)
		return err
	}

	return nil
}
