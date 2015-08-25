package main

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/bbhasiapacific/openinnovation/httputil"
	"github.com/bbhasiapacific/openinnovation/response"
	"github.com/bbhasiapacific/openinnovation/store"
	"github.com/gorilla/context"
)

func GetUser(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.FormValue("userID")
	if userIDStr == "me" {
		response.OK(w, store.CurrentUser(r))
		return
	}

	var parser store.Parser
	userID := parser.Int(userIDStr)
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)

	otherUser, err := store.GetUserWithParams(userID, store.GetUserParams{user.ID()})
	if err != nil {
		response.ServerError(w, err)
		return
	}

	if otherUser == nil {
		response.ClientError(w, http.StatusNotFound)
		return
	}

	response.OK(w, otherUser)
}

func GetAllUsers(w http.ResponseWriter, r *http.Request) {
	users, err := store.GetAllUsers()
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, users)
}

func Update(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		response.ServerError(w, err)
		return
	}

	user := context.Get(r, "user").(store.User)

	for k, v := range r.Form {
		switch k {
		case "fullname":
			err = user.UpdateFullname(v[0])
		case "title":
			err = user.UpdateTitle(v[0])
		case "description":
			err = user.UpdateDescription(v[0])
		case "interests":
			err = user.UpdateInterests(strings.Split(v[0], ","))
		}

		if err != nil {
			response.ServerError(w, err)
			return
		}
	}

	response.OK(w, nil)
}

func UpdateAvatar(w http.ResponseWriter, r *http.Request) {
	user := context.Get(r, "user").(store.User)
	url := fmt.Sprintf(store.UserAvatarURL, user.ID())

	finalURL, header, err := httputil.SaveFileWithExtension(w, r, "image", url)
	if err != nil || header == nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if err = user.UpdateAvatarURL(finalURL); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}

func AssignWorker(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	taskID := parser.Int(r.FormValue("taskID"))
	userID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	if r.FormValue("toggle") == "true" {
		if err := store.ToggleWorker(taskID, userID, user.ID()); err != nil {
			response.ServerError(w, err)
		}
		response.OK(w, taskID)
		return
	}

	store.InsertWorker(taskID, userID, user.ID())
}

func UnassignWorker(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	taskID := parser.Int(r.FormValue("taskID"))
	userID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	store.DeleteWorker(taskID, userID)
}
