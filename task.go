package main

import (
	"net/http"

	"bbhoi.com/response"
	"bbhoi.com/store"
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
