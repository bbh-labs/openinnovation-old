package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/bbhasiapacific/bbhoi.com/debug"
	"github.com/bbhasiapacific/bbhoi.com/httputil"
	"github.com/bbhasiapacific/bbhoi.com/response"
	"github.com/bbhasiapacific/bbhoi.com/store"
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
		}

		if err != nil {
			response.ServerError(w, err)
			return
		}
	}

	response.OK(w, nil)
}

func UpdateAvatar(w http.ResponseWriter, r *http.Request) {
	// FIXME: there must be some other way changing directory
	if err := os.Chdir(store.ContentFolder); err != nil {
		response.ServerError(w, err)
		return
	}

	user := context.Get(r, "user").(store.User)

	url := fmt.Sprintf(store.UserAvatarURL, user.ID())
	finalURL, header, err := httputil.SaveFileWithExtension(w, r, "image", url)
	if err != nil || header == nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if err := os.Chdir(".."); err != nil {
		response.ServerError(w, err)
		return
	}

	if err = user.UpdateAvatarURL(finalURL); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}

func UpdateInterests(w http.ResponseWriter, r *http.Request) {
	user := context.Get(r, "user").(store.User)
	interests := strings.Split(r.FormValue("interests"), ",")

	if err := user.UpdateInterests(interests); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}

func CreatedProjects(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	userID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	ps, err := store.CreatedProjects(userID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, ps)
}

func InvolvedProjects(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	userID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	ps, err := store.InvolvedProjects(userID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, ps)
}

func CompletedProjects(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	userID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	ps, err := store.CompletedProjects(userID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, ps)
}

func CreateProject(w http.ResponseWriter, r *http.Request) {
	title := r.FormValue("title")
	if title == "" {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	tagline := r.FormValue("tagline")
	description := r.FormValue("description")

	// basic project info
	projectID, err := store.CreateProject(map[string]string{
		"authorID":    user.IDStr(),
		"title":       title,
		"tagline":     tagline,
		"description": description,
	})
	if err != nil {
		response.ServerError(w, err)
		return
	}

	var ok bool

	// add author to project user list
	if err = store.AddMember(projectID, user.ID()); err != nil {
		goto error
	}

	// image
	if ok, err = store.SaveProjectImage(w, r, projectID); err != nil || !ok {
		goto error
	}

	response.OK(w, projectID)
	return

error:
	if err := store.DeleteProject(projectID); err != nil {
		debug.Warn(err)
	}
	response.ServerError(w, err)
}

func DeleteProject(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	if !user.IsAuthor(projectID) {
		response.ClientError(w, http.StatusUnauthorized)
		return
	}

	if err := store.DeleteProject(projectID); err != nil {
		response.ServerError(w, err)
		return
	}
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
