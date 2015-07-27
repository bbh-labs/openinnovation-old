package store

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"bbhoi.com/debug"
	"bbhoi.com/formutil"
	"bbhoi.com/httputil"
	"bbhoi.com/response"
	"bbhoi.com/session"
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
	interests text[],
	verification_code text NOT NULL,
	is_admin boolean NOT NULL,
	updated_at timestamp NOT NULL,
	created_at timestamp NOT NULL`
)

type User interface {
	ID() int64
	Exists() bool
	Update(w http.ResponseWriter, r *http.Request)
	UpdateInterests(w http.ResponseWriter, r *http.Request)
	SaveAvatar(w http.ResponseWriter, r *http.Request)

	CreatedProjects(w http.ResponseWriter, r *http.Request)
	InvolvedProjects(w http.ResponseWriter, r *http.Request)
	CompletedProjects(w http.ResponseWriter, r *http.Request)

	CreateProject(w http.ResponseWriter, r *http.Request)
	UpdateProject(w http.ResponseWriter, r *http.Request)
	JoinProject(w http.ResponseWriter, r *http.Request)

	AddProjectUser(w http.ResponseWriter, r *http.Request)

	IsAuthor(projectID int64) bool
	IsAdmin() bool
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
	isAdmin          bool      `json:"isAdmin"`
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

func (u user) IsAdmin() bool {
	return u.isAdmin
}

func (u user) Exists() bool {
	return u.Email != ""
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	userID, err := formutil.Number(r, "userID")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	const rawSQL = `
	SELECT * FROM user_ WHERE id = $1 LIMIT 1`

	users, err := queryUsers(rawSQL, userID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	if len(users) == 0 {
		response.ClientError(w, http.StatusNotFound)
		return
	}

	response.OK(w, users[0])
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
			&u.isAdmin,
			&u.UpdatedAt,
			&u.CreatedAt,
		); err != nil {
			return nil, debug.Error(err)
		}

		us = append(us, u)
	}

	return us, nil
}

func (u user) Update(w http.ResponseWriter, r *http.Request) {
	const q = `UPDATE user_ SET nicename = $1, title = $2, description = $3 WHERE id = $4`

	name := r.FormValue("name")
	title := r.FormValue("title")
	description := r.FormValue("description")

	if _, err := db.Exec(q, name, title, description, u.id); err != nil {
		response.ServerError(w, err)
	}

	response.OK(w, nil)
}

func (u user) UpdateInterests(w http.ResponseWriter, r *http.Request) {
	const q = `UPDATE user_ SET interests = $1 WHERE id = $2`

	interests := strings.Split(r.FormValue("interests"), ",")

	if _, err := db.Exec(q, interests, u.id); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}

func (u user) updateAvatarURL(url string) error {
	const q = `UPDATE user_ SET avatarURL = $1 WHERE id = $2`

	if _, err := db.Exec(q, url, u.id); err != nil {
		return debug.Error(err)
	}
	return nil
}

func (u user) CreatedProjects(w http.ResponseWriter, r *http.Request) {
	userID, err := formutil.Number(r, "userID")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	const rawSQL = `SELECT * FROM project WHERE authorID = $1`

	ps, err := queryProjectsWithMembers(rawSQL, userID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, ps)
}

func (u user) InvolvedProjects(w http.ResponseWriter, r *http.Request) {
	userID, err := formutil.Number(r, "userID")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	const rawSQL = `
	SELECT project.* FROM project
	INNER JOIN project_user ON project_user.project_id = project.id
	WHERE member.userID = $1`

	ps, err := queryProjectsWithMembers(rawSQL, userID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, ps)
}

func (u user) CompletedProjects(w http.ResponseWriter, r *http.Request) {
	userID, err := formutil.Number(r, "userID")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	const rawSQL = `
	SELECT project.* FROM project
	WHERE author_id = $1 AND status = $2`

	ps, err := queryProjectsWithMembers(rawSQL, userID, "completed")
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, ps)
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

func (u user) SaveAvatar(w http.ResponseWriter, r *http.Request) {
	url := fmt.Sprintf("oi-content/profile/img/%d/avatar.png", u.id)
	header, err := httputil.SaveFile(w, r, "image", url)
	if err != nil {
		response.ServerError(w, err)
		return
	}
	if header == nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}
	if err = u.updateAvatarURL(url); err != nil {
		response.ServerError(w, err)
		return
	}
	response.OK(w, nil)
}

func (u user) CreateProject(w http.ResponseWriter, r *http.Request) {
	title := r.FormValue("title")
	if title == "" {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	tagline := r.FormValue("tagline")
	if tagline == "" {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	description := r.FormValue("description")
	if description == "" {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	// basic project info
	projectID, err := insertProject(u.id, title, tagline, description)
	if err != nil {
		response.ServerError(w, err)
		return
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

	response.OK(w, projectID)
	return

error:
	if err := u.deleteProject(projectID); err != nil {
		debug.Warn(err)
	}
	response.ServerError(w, err)
}

func (u user) UpdateProject(w http.ResponseWriter, r *http.Request) {
	title := r.FormValue("projectTitle")

	// title can't be empty
	if title == "" {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	description := r.FormValue("projectDescription")

	projectID, err := strconv.ParseInt(r.FormValue("projectID"), 10, 0)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	// basic project info
	if err = updateProject(projectID, title, description); err != nil {
		response.ServerError(w, err)
		return
	}

	// image
	url := fmt.Sprintf("oi-content/project/img/%d/cover", projectID)
	header, err := httputil.SaveFileWithExtension(w, r, "cover", url)
	if err != nil {
		response.ServerError(w, err)
		return
	}
	if header != nil {
		if err = updateProjectImage(projectID, url); err != nil {
			response.ServerError(w, err)
			return
		}
	}
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

func (u user) JoinProject(w http.ResponseWriter, r *http.Request) {
	projectID, err := formutil.Number(r, "projectID")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	const rawSQL = `
	INSERT INTO members (projectID, userID, status)
	VALUES ($1, $2, $3)
	WHERE projectID = $4`

	if _, err := db.Exec(rawSQL, projectID, u.ID, "pending"); err != nil {
		response.ServerError(w, err)
	}
	response.OK(w, nil)
}

func (u user) IsAuthor(projectID int64) bool {
	return isAuthor(projectID, u.id)
}

func SetAdmin(w http.ResponseWriter, r *http.Request) {
	const rawSQL = `
	UPDATE user_ WHERE id = $1 WHERE is_admin = false
	SET is_admin = true`

	userID, err := formutil.Number(r, "userID")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if _, err := db.Exec(rawSQL, userID); err != nil {
		response.ServerError(w, err)
	}
}

func UnsetAdmin(w http.ResponseWriter, r *http.Request) {
	const rawSQL = `
	UPDATE user_ WHERE id = $1 WHERE is_admin = true
	SET is_admin = false`

	id, err := formutil.Number(r, "id")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if _, err := db.Exec(rawSQL, id); err != nil {
		response.ServerError(w, err)
	}
}

func GetAdmins(w http.ResponseWriter, r *http.Request) {
	count, err := formutil.Number(r, "count")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	const rawSQL = `
	SELECT * FROM user_ WHERE is_admin = true
	LIMIT $1`

	users, err := queryUsers(rawSQL, count)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, users)
}

func GetUserByID(userID int64) (User, error) {
	const rawSQL = `
	SELECT * FROM user_ WHERE id = $1`

	var u user
	if err := db.QueryRow(rawSQL, userID).Scan(
		&u.id,
		&u.Email,
		&u.Password,
		&u.Fullname,
		&u.Description,
		&u.Title,
		&u.AvatarURL,
		&u.VerificationCode,
		&u.isAdmin,
		&u.UpdatedAt,
		&u.CreatedAt,
	); err != nil {
		return nil, debug.Error(err)
	}

	return u, nil
}

func GetUserByEmail(email string) (User, error) {
	const rawSQL = `
	SELECT * FROM user_ WHERE email = $1`

	var u user
	if err := db.QueryRow(rawSQL, email).Scan(
		&u.id,
		&u.Email,
		&u.Password,
		&u.Fullname,
		&u.Description,
		&u.Title,
		&u.AvatarURL,
		&u.VerificationCode,
		&u.isAdmin,
		&u.UpdatedAt,
		&u.CreatedAt,
	); err != nil {
		return nil, debug.Error(err)
	}

	return u, nil
}

func CurrentUser(r *http.Request) User {
	user, err := GetUserByEmail(session.GetEmail(r))
	if err != nil {
		debug.Warn(err)
	}
	return user
}
