package main

import (
	"net/http"

	"bbhoi.com/response"
	"bbhoi.com/store"
)

func GetChats(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	channelID := parser.Int(r.FormValue("channelID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	channelType := r.FormValue("channelType")

	chats, err := store.GetChats(channelID, channelType)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, chats)
}

