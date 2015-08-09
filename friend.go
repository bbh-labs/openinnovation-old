package main

import (
	"net/http"

	"github.com/bbhasiapacific/bbhoi.com/response"
	"github.com/bbhasiapacific/bbhoi.com/store"
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

	response.OK(w, users)
}

func AddFriend(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	userID := parser.Int(r.FormValue("userID"))
	otherUserID := parser.Int(r.FormValue("otherUserID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if err := store.AddFriend(userID, otherUserID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}

func RemoveFriend(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	userID := parser.Int(r.FormValue("userID"))
	otherUserID := parser.Int(r.FormValue("otherUserID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if err := store.RemoveFriend(userID, otherUserID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}
