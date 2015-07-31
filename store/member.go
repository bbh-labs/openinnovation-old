package store

import (
	"net/http"

	"bbhoi.com/debug"
	"bbhoi.com/response"
)

const (
	createMemberSQL = `
	project_id int NOT NULL,
	user_id int NOT NULL`
)

func GetMembers(w http.ResponseWriter, r *http.Request) {
	var parser Parser

	projectID := parser.Int(r.FormValue("projectID"))
	if parser.Err != nil {
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
	var parser Parser

	projectID := parser.Int(r.FormValue("projectID"))
	userID:= parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if !u.IsAuthor(projectID) {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	if exists, err := memberExists(projectID, userID); err != nil {
		response.ServerError(w, err)
		return
	} else if exists {
		response.OK(w, nil)
		return
	}

	if err := addMember(projectID, userID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}

func addMember(projectID, userID int64) error {
	const rawSQL = `
	INSERT INTO member (project_id, user_id) VALUES ($1, $2)`

	if _, err := db.Exec(rawSQL, projectID, userID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func memberExists(projectID, userID int64) (bool, error) {
	const rawSQL = `
	SELECT COUNT(*) FROM member
	WHERE project_id = $1 AND user_id = $2`

	return exists(rawSQL)
}

func (u user) RemoveMember(w http.ResponseWriter, r *http.Request) {
	var parser Parser

	projectID := parser.Int(r.FormValue("projectID"))
	userID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if !u.IsAuthor(projectID) {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	if exists, err := memberExists(projectID, userID); err != nil {
		response.ServerError(w, err)
		return
	} else if exists {
		response.OK(w, nil)
		return
	}

	if err := removeMember(projectID, userID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}

func removeMember(projectID, userID int64) error {
	const rawSQL = `
	DELETE FROM member WHERE project_id = $1 AND user_id = $2`

	if _, err := db.Exec(rawSQL, projectID, userID); err != nil {
		return debug.Error(err)
	}

	return nil
}
