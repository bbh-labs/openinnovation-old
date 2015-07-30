package store

import (
	"net/http"

	"bbhoi.com/debug"
	"bbhoi.com/formutil"
	"bbhoi.com/response"
)

const (
	createMemberSQL = `
	project_id int NOT NULL,
	user_id int NOT NULL`
)

func GetMembers(w http.ResponseWriter, r *http.Request) {
	projectID, err := formutil.Number(r, "projectID")
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	users, err := getMembers(projectID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, users)
}

func getMembers(projectID int64) ([]User, error) {
	const rawSQL = `
	SELECT user_.* FROM user_
	INNER JOIN member ON member.user_id = user_.id
	WHERE project_id = $1`

	return queryUsers(rawSQL, projectID)
}

func (u user) AddMember(w http.ResponseWriter, r *http.Request) {
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

	if memberExists(projectID, userID) {
		response.OK(w, nil)
		return
	}

	if err = addMember(projectID, userID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}

func memberExists(projectID, userID int64) bool {
	const rawSQL = `
	SELECT COUNT(*) FROM member
	WHERE project_id = $1 AND user_id = $2`

	return exists(rawSQL)
}

func addMember(projectID, userID int64) error {
	const rawSQL = `
	INSERT INTO member (project_id, user_id) VALUES ($1, $2)`

	if _, err := db.Exec(rawSQL, projectID, userID); err != nil {
		return debug.Error(err)
	}

	return nil
}
