package main

import (
	"net/http"

	"bbhoi.com/response"
	"bbhoi.com/store"
	"github.com/gorilla/context"
)

func GetMembers(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	users, err := store.GetMembers(projectID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, users)
}

func AddMember(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	userID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	if !user.IsAuthor(projectID) {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	if exists, err := store.MemberExists(projectID, userID); err != nil {
		response.ServerError(w, err)
		return
	} else if exists {
		response.OK(w, nil)
		return
	}

	if err := store.AddMember(projectID, userID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}

func RemoveMember(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	userID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	if !user.IsAuthor(projectID) {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	if exists, err := store.MemberExists(projectID, userID); err != nil {
		response.ServerError(w, err)
		return
	} else if exists {
		response.OK(w, nil)
		return
	}

	if err := store.RemoveMember(projectID, userID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}
