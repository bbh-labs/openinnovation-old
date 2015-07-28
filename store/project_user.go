package store

import (
	"net/http"

	"bbhoi.com/debug"
	"bbhoi.com/formutil"
	"bbhoi.com/response"
)

const (
	createProjectUserSQL = `
	project_id int NOT NULL,
	user_id int NOT NULL`
)

func ProjectUsers(w http.ResponseWriter, r *http.Request) {
	projectID, err := formutil.Number(r, "projectID")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	const rawSQL = `
	SELECT * FROM _user
	INNER JOIN project_user ON project_user.user_id = user_.id
	WHERE project_id = $1`

	users, err := queryUsers(rawSQL, projectID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, users)
}

func (u user) AddProjectUser(w http.ResponseWriter, r *http.Request) {
	projectID, err := formutil.Number(r, "projectID")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if !u.IsAuthor(projectID) {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	userID, err := formutil.Number(r, "userID")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	const existSQL = `
	SELECT COUNT(*) FROM project_user
	WHERE project_id = $1 AND user_id = $2`

	if exists(existSQL) {
		response.OK(w, nil)
		return
	}

	const rawSQL = `
	INSERT INTO project_user (project_id, user_id) VALUES ($1, $2)`

	if err := addProjectUser(projectID, userID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}

func addProjectUser(projectID, userID int64) error {
	const rawSQL = `
	INSERT INTO project_user (project_id, user_id) VALUES ($1, $2)`

	if _, err := db.Exec(rawSQL, projectID, userID); err != nil {
		return debug.Error(err)
	}

	return nil
}
