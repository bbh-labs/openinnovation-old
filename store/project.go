package store

import (
	"time"

	"bbhoi.com/debug"
)

const (
	createProjectSQL = `
	id serial PRIMARY KEY,
	authorID int NOT NULL,
	title text NOT NULL,
	description text NOT NULL,
	coverURL text NOT NULL,
	introURL text NOT NULL,
	viewCount int NOT NULL,
	status text NOT NULL,
	recommended boolean NOT NULL,
	createdAt timestamp NOT NULL`
)

type Project struct {
	ID          int64     `json:"id,omitempty"`
	AuthorID    int64     `json:"authorID,omitempty"`
	Title       string    `json:"title,omitempty"`
	Description string    `json:"description,omitempty"`
	CoverURL    string    `json:"coverURL,omitempty"`
	IntroURL    string    `json:"introURL,omitempty"`
	ViewCount   int64     `json:"viewCount"`
	Status      string    `json:"status"`
	Recommended bool      `json:"recommended,omitempty"`
	CreatedAt   time.Time `json:"createdAt,omitempty"`

	Author     User        `json:"author"`
	Members    []User      `json:"members"`
	Comments   []Comment   `json:"comments"`
	Tasks      []Task      `json:"tasks"`
	Milestones []Milestone `json:"milestones"`
}

func insertProject(authorID int64, title, description string) (int64, error) {
	const q = `
	INSERT INTO project (authorID, title, description, coverURL, introURL, viewCount, status, recommended, createdAt)
	VALUES (?, ?, ?, "", "", 0, "open", false, NOW())`

	res, err := db.Exec(q, authorID, title, description)
	if err != nil {
		return 0, debug.Error(err)
	}
	return res.LastInsertId()
}

func updateProject(projectID int64, title, description string) error {
	const q = `UPDATE project SET title = ?, description = ? WHERE id = ?`

	if _, err := db.Exec(q, title, description, projectID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func updateProjectCover(projectID int64, coverURL string) error {
	const q = `UPDATE project SET coverURL = ? WHERE id = ?`

	if _, err := db.Exec(q, coverURL, projectID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func updateProjectIntro(projectID int64, introURL string) error {
	const q = `UPDATE project SET introURL = ? WHERE id = ?`

	if _, err := db.Exec(q, introURL, projectID); err != nil {
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
		&p.CoverURL,
		&p.IntroURL,
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
			&p.CoverURL,
			&p.IntroURL,
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
			&p.CoverURL,
			&p.IntroURL,
			&p.ViewCount,
			&p.Status,
			&p.Recommended,
			&p.CreatedAt,
		); err != nil {
			return nil, debug.Error(err)
		}

		p.Members = GetProjectMembers(p.ID, "accepted")

		ps = append(ps, p)
	}

	return ps, nil
}

func GetProjectMembers(projectID int64, status string) []User {
	return GetMembers(projectID, status)
}

func isAuthor(projectID, userID int64) bool {
	const q = `
	SELECT authorID FROM project
	WHERE projectID WHERE ?`

	var authorID int64
	if err := db.QueryRow(q, projectID).Scan(&authorID); err != nil {
		debug.Warn(err)
		return false
	}

	return authorID == userID
}
