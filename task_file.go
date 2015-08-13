package main

import (
	"net/http"

	"github.com/bbhasiapacific/bbhoi.com/response"
	"github.com/bbhasiapacific/bbhoi.com/store"
)

func GetTaskFiles(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	taskID := parser.Int(r.FormValue("taskID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	files, err := store.GetTaskFiles(taskID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, files)
}

func CreateTaskFile(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	taskID := parser.Int(r.FormValue("taskID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	fileID := r.FormValue("fileID")

	if err := store.CreateTaskFile(taskID, fileID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}

func DeleteTaskFile(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	taskID := parser.Int(r.FormValue("taskID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	fileID := r.FormValue("fileID")

	if err := store.DeleteTaskFile(taskID, fileID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}
