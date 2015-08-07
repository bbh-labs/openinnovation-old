package main

import (
	"net/http"

	"github.com/bbhasiapacific/bbhoi.com/debug"
	"github.com/bbhasiapacific/bbhoi.com/response"
	"github.com/bbhasiapacific/bbhoi.com/store"
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

func PostChat(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	userID := parser.Int(r.FormValue("userID"))
	channelID := parser.Int(r.FormValue("channelID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	chatParams := store.PostChatParams{
		UserID: userID,
		ChannelID: channelID,
		ChannelType: r.FormValue("channelType"),
		Text: r.FormValue("text"),
	}

	id, err := store.PostChat(chatParams)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	if err = store.NotifyChat(store.NotifyChatParams{id, chatParams}); err != nil {
		debug.Warn(err)
		return
	}

	response.OK(w, id)
}
