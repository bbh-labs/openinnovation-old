package main

import (
	"net/http"

	"github.com/bbhasiapacific/bbhoi.com/response"
	"github.com/bbhasiapacific/bbhoi.com/store"
	"github.com/gorilla/context"
)

func GetFriends(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	userID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	users, err := store.GetFriends(userID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	for i := range users {
		if _, ok := h.connections[users[i].ID()]; ok {
			users[i].SetStatus("Online")
		} else {
			users[i].SetStatus("Offline")
		}
	}

	response.OK(w, users)
}

func AddFriend(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser
	otherUserID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	if isFriend, err := store.IsFriend(user.ID(), otherUserID); err != nil {
		response.ServerError(w, err)
		return
	} else if isFriend {
		response.OK(w, nil)
		return
	}

	if err := store.AddFriend(user.ID(), otherUserID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}

func RemoveFriend(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser
	otherUserID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	if isFriend, err := store.IsFriend(user.ID(), otherUserID); err != nil {
		response.ServerError(w, err)
		return
	} else if !isFriend {
		response.OK(w, nil)
		return
	}

	if err := store.RemoveFriend(user.ID(), otherUserID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}
