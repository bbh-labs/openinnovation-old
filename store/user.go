package store

import (
	"database/sql"
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"
	"time"

	"bbhoi.com/debug"
	"bbhoi.com/httputil"
)

const (
	createUserSQL = `
	id serial PRIMARY KEY,
	email text NOT NULL,
	password text NOT NULL,
	fullname text NOT NULL,
	title text NOT NULL,
	description text NOT NULL,
	avatar_url text NOT NULL,
	verification_code text NOT NULL,
	is_admin boolean NOT NULL,
	updated_at timestamp NOT NULL,
	created_at timestamp NOT NULL`
)

type User interface {
	ID() int64
	Exists() bool
	Update(name, title, description string) error
	UpdateInterests(interests string) error
	SaveAvatar(w http.ResponseWriter, r *http.Request) (*multipart.FileHeader, error)

	CreatedProjects() ([]Project, error)
	InvolvedProjects() ([]Project, error)
	CompletedProjects() ([]Project, error)

	Skills() ([]int64, error)

	CreateProject(w http.ResponseWriter, r *http.Request) (int64, error)
	UpdateProject(w http.ResponseWriter, r *http.Request) error
	JoinProject(projectID int64) error

	IsAuthor(projectID int64) bool
}

type user struct {
	id               int64     `json:"id,omitempty"`
	Email            string    `json:"email,omitempty"`
	Password         string    `json:"-"`
	Fullname         string    `json:"fullname,omitempty"`
	Title            string    `json:"title,omitempty"`
	Description      string    `json:"description,omitempty"`
	AvatarURL        string    `json:"avatarURL,omitempty"`
	VerificationCode string    `json:"-"`
	IsAdmin          bool      `json:"isAdmin"`
	UpdatedAt        time.Time `json:"updatedAt,omitempty"`
	CreatedAt        time.Time `json:"createdAt,omitempty"`

	CreatedProjectsCount_   int64 `json:"created_projects_count"`
	CompletedProjectsCount_ int64 `json:"completed_projects_count"`
	InvolvedProjectsCount_  int64 `json:"involved_projects_count"`
	CompletedTasksCount_    int64 `json:"completed_tasks_count"`

	MaxCreatedProjectsCount_   int64 `json:"max_created_projects_count"`
	MaxCompletedProjectsCount_ int64 `json:"max_completed_projects_count"`
	MaxInvolvedProjectsCount_  int64 `json:"max_involved_projects_count"`
	MaxCompletedTasksCount_    int64 `json:"max_completed_tasks_count"`
}

func (u user) ID() int64 {
	return u.id
}

func (u user) ShortDescription(n int) string {
	if n >= len(u.Description) {
		return u.Description
	}
	return u.Description[:n]
}

func (u user) ChangePassword(newpass string) error {
	return nil
}

func (u user) Exists() bool {
	return u.Email != ""
}

func HasUserWithEmail(email string) bool {
	const q = `SELECT COUNT(*) FROM user_ WHERE email = $1`

	var count int64
	if err := db.QueryRow(q, email).Scan(&count); err != nil {
		if err != sql.ErrNoRows {
			debug.Warn(err)
		}
		return false
	}
	return count > 0
}

func insertUser(m map[string]string) error {
	const q = `
	INSERT INTO user_ (email, password, fullname, title, description, avatar_url, verification_code, is_admin, updated_at, created_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, now(), now())`

	if _, err := db.Exec(q,
		m["email"],
		m["password"],
		m["fullname"],
		m["title"],
		m["description"],
		m["avatarURL"],
		m["verificationCode"],
	); err != nil {
		return debug.Error(err)
	}

	return nil
}

func GetUser(data interface{}) User {
	var row *sql.Row
	switch t := data.(type) {
	case int64:
		row = db.QueryRow(`SELECT * FROM user_ WHERE id = $1`, t)
	case string:
		row = db.QueryRow(`SELECT * FROM user_ WHERE email = $1`, t)
	}

	u := user{}
	if err := row.Scan(
		&u.id,
		&u.Email,
		&u.Password,
		&u.Fullname,
		&u.Title,
		&u.Description,
		&u.AvatarURL,
		&u.VerificationCode,
		&u.IsAdmin,
		&u.UpdatedAt,
		&u.CreatedAt,
	); err != nil && err != sql.ErrNoRows {
		debug.Warn(err)
		return u
	}

	return u
}

func SearchUsers(term string) ([]User, error) {
	const q = `SELECT * FROM user_ WHERE fullname LIKE $1`
	return queryUsers(q, "%"+term+"%")
}

func MostActiveUsers(count int64) ([]User, error) {
	const q = `SELECT * FROM user_ LIMIT $1`

	rows, err := db.Query(q, count)
	if err != nil {
		return nil, debug.Error(err)
	}
	defer rows.Close()

	var us []User
	for rows.Next() {
		var u user

		if err = rows.Scan(
			&u.id,
			&u.Email,
			&u.Password,
			&u.Fullname,
			&u.Title,
			&u.Description,
			&u.AvatarURL,
			&u.VerificationCode,
			&u.IsAdmin,
			&u.UpdatedAt,
			&u.CreatedAt,
		); err != nil {
			return nil, debug.Error(err)
		}

		u.CreatedProjectsCount_ = u.CreatedProjectsCount()
		u.InvolvedProjectsCount_ = u.InvolvedProjectsCount()
		u.CompletedProjectsCount_ = u.CompletedProjectsCount()
		u.MaxCreatedProjectsCount_ = MaxCreatedProjectsCount()
		u.MaxInvolvedProjectsCount_ = MaxInvolvedProjectsCount()
		u.MaxCompletedProjectsCount_ = MaxCompletedProjectsCount()

		us = append(us, u)
	}

	return us, nil
}

func queryUsers(q string, data ...interface{}) ([]User, error) {
	rows, err := db.Query(q, data...)
	if err != nil {
		return nil, debug.Error(err)
	}
	defer rows.Close()

	var us []User
	for rows.Next() {
		var u user

		if err = rows.Scan(
			&u.id,
			&u.Email,
			&u.Password,
			&u.Fullname,
			&u.Description,
			&u.Title,
			&u.AvatarURL,
			&u.VerificationCode,
			&u.IsAdmin,
			&u.UpdatedAt,
			&u.CreatedAt,
		); err != nil {
			return nil, debug.Error(err)
		}

		us = append(us, u)
	}

	return us, nil
}

func (u user) Update(name, title, description string) error {
	const q = `UPDATE user_ SET nicename = $1, title = $2, description = $3 WHERE id = $4`

	if _, err := db.Exec(q, name, title, description, u.id); err != nil {
		return debug.Error(err)
	}
	return nil
}

func (u user) UpdateInterests(interests string) error {
	const q = `UPDATE user_ SET interests = $1 WHERE id = $2`

	if _, err := db.Exec(q, interests, u.id); err != nil {
		return debug.Error(err)
	}
	return nil
}

func (u user) updateAvatarURL(url string) error {
	const q = `UPDATE user_ SET avatarURL = $1 WHERE id = $2`

	if _, err := db.Exec(q, url, u.id); err != nil {
		return debug.Error(err)
	}
	return nil
}

func (u user) CreatedProjects() ([]Project, error) {
	const q = `SELECT * FROM project WHERE authorID = $1`

	return queryProjectsWithMembers(q, u.id)
}

func (u user) InvolvedProjects() ([]Project, error) {
	const q = `
	SELECT project.* FROM project
	INNER JOIN member ON member.projectID = project.id
	WHERE member.userID = $1`

	return queryProjectsWithMembers(q, u.id)
}

func (u user) CompletedProjects() ([]Project, error) {
	const q = `
	SELECT project.* FROM project
	WHERE status = $1`

	return queryProjectsWithMembers(q, "completed")
}

func (u user) CreatedProjectsCount() int64 {
	const q = `SELECT COUNT(*) FROM project WHERE authorID = $1`

	return count(q, u.id)
}

func (u user) InvolvedProjectsCount() int64 {
	const q = `
	SELECT COUNT(project.*) FROM project
	INNER JOIN member ON member.projectID = project.id
	WHERE member.userID = $1`

	return count(q, u.id)
}

func (u user) CompletedProjectsCount() int64 {
	const q = `
	SELECT COUNT(project.*) FROM project
	WHERE status = 'completed' AND project.authorID = $1`

	return count(q, u.id)
}

func MaxCreatedProjectsCount() int64 {
	const q = `
	SELECT MAX(n) FROM (
		SELECT COUNT(*) AS n FROM project
		GROUP BY project.authorID
	) as n`

	return count(q)
}

func MaxInvolvedProjectsCount() int64 {
	const q = `
	SELECT MAX(n) FROM (
		SELECT COUNT(project.*) AS n FROM project
		INNER JOIN member ON member.projectID = project.id
		GROUP BY member.userID
	) as n`

	return count(q)
}

func MaxCompletedProjectsCount() int64 {
	const q = `
	SELECT MAX(n) FROM (
		SELECT COUNT(project.*) AS n FROM project
		WHERE status = 'completed
		GROUP BY project.authorID'
	) as n`

	return count(q)
}

func (u user) Skills() ([]int64, error) {
	const q = `SELECT
					(SELECT COUNT(*) FROM task WHERE category = "design"),
					(SELECT COUNT(*) FROM task WHERE category = "copywriting"),
					(SELECT COUNT(*) FROM task WHERE category = "art-direction"),
					(SELECT COUNT(*) FROM task WHERE category = "photography"),
					(SELECT COUNT(*) FROM task WHERE category = "filming"),
					(SELECT COUNT(*) FROM task WHERE category = "software"),
					(SELECT COUNT(*) FROM task WHERE category = "planning"),
					(SELECT COUNT(*) FROM task WHERE category = "management"),
					(SELECT COUNT(*) FROM task WHERE category = "marketing"),
					(SELECT COUNT(*) FROM task WHERE category = "pr"),
					(SELECT COUNT(*) FROM task WHERE category = "production"),
					(SELECT COUNT(*) FROM task WHERE category = "others")
			   FROM task
			   INNER JOIN doer ON task.id = doer.taskID
			   WHERE doer.userID = $1
			   GROUP BY category`

	var ss [12]int64

	if err := db.QueryRow(q, u.id).Scan(
		&ss[0],
		&ss[1],
		&ss[2],
		&ss[3],
		&ss[4],
		&ss[5],
		&ss[6],
		&ss[7],
		&ss[8],
		&ss[9],
		&ss[10],
		&ss[11],
	); err != nil && err != sql.ErrNoRows {
		return nil, debug.Error(err)
	}

	return ss[:], nil
}


func (u user) SaveAvatar(w http.ResponseWriter, r *http.Request) (*multipart.FileHeader, error) {
	url := fmt.Sprintf("oi-content/profile/img/%d/avatar.png", u.id)
	header, err := httputil.SaveFile(w, r, "image", url)
	if err != nil {
		return nil, debug.Error(err)
	}
	if header == nil {
		return nil, nil
	}
	if err = u.updateAvatarURL(url); err != nil {
		return header, err
	}
	return header, nil
}

func (u user) CreateProject(w http.ResponseWriter, r *http.Request) (int64, error) {
	title := r.FormValue("title")
	if title == "" {
		return 0, nil
	}

	tagline := r.FormValue("tagline")
	if tagline == "" {
		return 0, nil
	}

	description := r.FormValue("description")
	if description == "" {
		return 0, nil
	}

	// basic project info
	projectID, err := insertProject(u.id, title, tagline, description)
	if err != nil {
		return 0, debug.Error(err)
	}

	// image
	url := fmt.Sprintf("oi-content/project/img/%d/cover", projectID)
	header, err := httputil.SaveFileWithExtension(w, r, "image", url)
	if err != nil || header == nil {
		goto error
	}
	if err = updateProjectImage(projectID, url); err != nil {
		goto error
	}

	return projectID, nil

error:
	if err2 := u.deleteProject(projectID); err2 != nil {
		debug.Warn(err2)
	}
	return 0, debug.Error(err)
}

func (u user) UpdateProject(w http.ResponseWriter, r *http.Request) error {
	title := r.FormValue("projectTitle")

	// title can't be empty
	if title == "" {
		return nil
	}

	description := r.FormValue("projectDescription")

	projectID, err := strconv.ParseInt(r.FormValue("projectID"), 10, 0)
	if err != nil {
		return debug.Error(err)
	}

	// basic project info
	if err = updateProject(projectID, title, description); err != nil {
		return debug.Error(err)
	}

	// image
	url := fmt.Sprintf("oi-content/project/img/%d/cover", projectID)
	header, err := httputil.SaveFileWithExtension(w, r, "cover", url)
	if err != nil {
		return debug.Error(err)
	}
	if header != nil {
		if err = updateProjectImage(projectID, url); err != nil {
			return debug.Error(err)
		}
	}

	return nil
}

func (u user) deleteProject(projectID int64) error {
	const q = `DELETE FROM project WHERE id = $1`

	if _, err := db.Exec(q, projectID); err != nil {
		return debug.Error(err)
	}

	if err := os.RemoveAll(fmt.Sprintf("oi-content/project/img/%d", projectID)); err != nil {
		return debug.Error(err)
	}
	return nil
}

func (u user) JoinProject(projectID int64) error {
	const q = `
	INSERT INTO members (projectID, userID, status)
	VALUES ($1, $2, $3)
	WHERE projectID = $4`

	if _, err := db.Exec(q, projectID, u.ID, "pending"); err != nil {
		return debug.Error(err)
	}
	return nil
}

func (u user) IsAuthor(projectID int64) bool {
	return isAuthor(projectID, u.id)
}
