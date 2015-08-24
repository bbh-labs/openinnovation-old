package main

import (
	"net/http"
	"strings"

	"github.com/bbhasiapacific/openinnovation/debug"
	"github.com/bbhasiapacific/openinnovation/response"
	"github.com/bbhasiapacific/openinnovation/store"
	"github.com/gorilla/context"
)

func init() {
	store.Notify = onNotify
}

// id/userID/channelID/channelType
func onNotify(channel, extra string) {
	params := strings.Split(extra, "/")
	if len(params) < 5 {
		return
	}

	var parser store.Parser
	id := parser.Int(params[1])
	userID := parser.Int(params[2])
	channelID := parser.Int(params[3])
	channelType := params[4]
	if parser.Err != nil {
		return
	}

	notification := struct {
		ID          int64  `json:"id"`
		UserID      int64  `json:"userID"`
		ChannelID   int64  `json:"channelID"`
		ChannelType string `json:"channelType"`
	}{
		ID:          id,
		UserID:      userID,
		ChannelID:   channelID,
		ChannelType: channelType,
	}

	switch channelType {
	case "user":
		h.notifyUser(userID, channelID, "newChatMessage", notification)
	case "project":
		h.notifyProject(channelID, "newChatMessage", notification)
	}
}

func GetChats(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		response.ServerError(w, err)
		return
	}

	var parser store.Parser
	var startID int64 = 0
	var count int64 = 10

	if v, ok := r.Form["count"]; ok {
		count = parser.Int(v[0])
	}

	if v, ok := r.Form["startID"]; ok {
		startID = parser.Int(v[0])
	}

	channelID := parser.Int(r.FormValue("channelID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}
	channelType := r.FormValue("channelType")

	user := context.Get(r, "user").(store.User)
	chats, err := store.GetChats(user.ID(), channelID, channelType, startID, count)
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
		UserID:      userID,
		ChannelID:   channelID,
		ChannelType: r.FormValue("channelType"),
		Text:        r.FormValue("text"),
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
