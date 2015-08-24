package main

import (
	"net/http"

	"github.com/bbhasiapacific/openinnovation/response"
	"github.com/bbhasiapacific/openinnovation/store"
)

func GetWorkers(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	taskID := parser.Int(r.FormValue("taskID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	workers, err := store.GetWorkers(taskID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, workers)
}
