package main

import (
	"net/http"

	"github.com/bbhasiapacific/bbhoi.com/response"
	"github.com/bbhasiapacific/bbhoi.com/store"
	"github.com/gorilla/context"
)

func GetTask(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	taskID := parser.Int(r.FormValue("taskID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	task, err := store.GetTask(taskID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	if task == nil {
		response.ClientError(w, http.StatusNotFound)
		return
	}

	response.OK(w, task)
}

func GetTasks(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	tasks, err := store.GetTasks(projectID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, tasks)
}

func CreateTask(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	startDate := parser.Time(r.FormValue("startDate"))
	endDate := parser.Time(r.FormValue("endDate"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if startDate.After(endDate) {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	if !user.IsMember(projectID) {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	var taskID int64
	var err error

	if taskID, err = store.CreateTask(store.CreateTaskParams{
		AuthorID:    user.ID(),
		ProjectID:   projectID,
		Title:       r.FormValue("title"),
		Description: r.FormValue("description"),
		Done:        false,
		Tags:        r.FormValue("tags"),
		StartDate:   startDate,
		EndDate:     endDate,
	}); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, taskID)
}

func LatestTasks(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	count := parser.Int(r.FormValue("count"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	tasks, err := store.LatestTasks(r.FormValue("title"), count)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, tasks)
}

func UpdateTask(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	if parser.Err != nil {
		response.ServerError(w, parser.Err)
		return
	}

	user := context.Get(r, "user").(store.User)
	if !user.IsMember(projectID) {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	var taskID int64
	if err := store.UpdateTask(store.UpdateTaskParams{
		TaskID:      r.FormValue("taskID"),
		Title:       r.FormValue("title"),
		Description: r.FormValue("description"),
		Tags:        r.FormValue("tags"),
		StartDate:   r.FormValue("startDate"),
		EndDate:     r.FormValue("endDate"),
	}); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, taskID)
}

func ToggleTaskStatus(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	taskID := parser.Int(r.FormValue("taskID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	if !user.IsMember(projectID) {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	if err := store.ToggleTaskStatus(taskID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, taskID)
}

func DeleteTask(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	if !user.IsMember(projectID) {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	if err := store.DeleteTask(store.DeleteTaskParams{
		TaskID: r.FormValue("taskID"),
	}); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}
