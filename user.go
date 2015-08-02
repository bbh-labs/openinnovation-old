package main

import (
	"net/http"

	"bbhoi.com/response"
	"bbhoi.com/store"
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

	user, err := store.GetUser(userID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	if user == nil {
		response.ClientError(w, http.StatusNotFound)
		return
	}

	response.OK(w, user)
}
