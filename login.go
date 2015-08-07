package main

import (
	"net/http"
	"strings"

	"github.com/bbhasiapacific/bbhoi.com/config"
	"github.com/bbhasiapacific/bbhoi.com/response"
	"github.com/bbhasiapacific/bbhoi.com/session"
	"github.com/bbhasiapacific/bbhoi.com/store"
)

func Login(w http.ResponseWriter, r *http.Request) {
	t := r.FormValue("loginFrom")
	switch t {
	default:
		email := r.FormValue("email")
		pass := r.FormValue("password")

		// check email and password length
		if len(email) < config.EmailLength() || len(pass) < config.PasswordLength() {
			response.ClientError(w, http.StatusBadRequest)
			return
		}

		// check if email is from BBH
		if email != "aqiank@gmail.com" && email != "veeableful@gmail.com" {
			if !strings.HasSuffix(email, "@bartleboglehegarty.com") {
				response.ClientError(w, http.StatusUnauthorized)
				return
			}
		}

		// check if email and password are valid
		if valid, err := store.ValidLogin(email, pass); err != nil {
			response.ServerError(w, err)
			return
		} else if !valid {
			response.ClientError(w, http.StatusUnauthorized)
			return
		}

		// start login session
		session.Set(w, r, email)
	}

	user := store.CurrentUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	response.OK(w, user)
}
