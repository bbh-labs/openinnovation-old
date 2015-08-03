package main

import (
	"net/http"
	"strings"

	"bbhoi.com/config"
	"bbhoi.com/response"
	"bbhoi.com/store"
)

func Register(w http.ResponseWriter, r *http.Request) {
	// check if user already exists
	email := r.FormValue("email")
	if store.HasUserWithEmail(email) {
		response.OK(w, "User already registered!")
		return
	}

	// check if email is from BBH
	if email != "aqiank@gmail.com" && email != "veeableful@gmail.com" {
		if !strings.HasSuffix(email, "@bartleboglehegarty.com") {
			response.ClientError(w, http.StatusBadRequest)
			return
		}
	}

	// check email and password length
	pass := r.FormValue("password")
	if len(email) < config.EmailLength() || len(pass) < config.PasswordLength() {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	// check fullname
	fullname := r.FormValue("fullname")
	if len(fullname) < 6 {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	// check title
	title := r.FormValue("title")
	if len(title) == 0 {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	// register the user
	if err := store.Register(email, pass, fullname, title, "", ""); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, "Successfully registered! Sent verification code to your email.")
}
