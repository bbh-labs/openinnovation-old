package main

import (
	"net/http"

	"bbhoi.com/response"
	"bbhoi.com/store"
	"github.com/gorilla/context"
)

func GetMilestone(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	milestoneID := parser.Int(r.FormValue("milestoneID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	milestone, err := store.GetMilestone(milestoneID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, milestone)
}

func GetMilestones(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	milestones, err := store.GetMilestones(projectID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, milestones)
}

func CreateMilestone(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	date := parser.Time(r.FormValue("date"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	if !user.IsAuthor(projectID) {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	title := r.FormValue("title")
	description := r.FormValue("description")

	var milestoneID int64
	var err error

	if milestoneID, err = store.CreateMilestone(store.CreateMilestoneParams{
		ProjectID:   projectID,
		Title:       title,
		Description: description,
		Date:        date,
	}); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, milestoneID)
}

func UpdateMilestone(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	milestoneID := parser.Int(r.FormValue("milestoneID"))
	date := parser.Time(r.FormValue("date"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	if !user.IsAuthor(projectID) {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	title := r.FormValue("title")
	description := r.FormValue("description")

	var err error
	if milestoneID, err = store.UpdateMilestone(store.UpdateMilestoneParams{
		MilestoneID: milestoneID,
		Title:       title,
		Description: description,
		Date:        date,
	}); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, milestoneID)
}

func DeleteMilestone(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	milestoneID := parser.Int(r.FormValue("milestoneID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if err := store.DeleteMilestone(milestoneID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}
