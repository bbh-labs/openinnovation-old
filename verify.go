package main

import (
	"net/http"

	"github.com/bbhmakerlab/openinnovation/response"
	"github.com/bbhmakerlab/openinnovation/store"
)

func Verify(w http.ResponseWriter, r *http.Request) {
	email := r.FormValue("email")
	code := r.FormValue("verificationCode")

	verified := store.IsUserVerified(email)
	if verified {
		response.OK(w, "Already verified!")
		return
	}

	valid := store.ValidVerificationCode(email, code)
	if !valid {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if err := store.VerifyUser(email); err != nil {
		response.ServerError(w, err)
		return
	}

	http.Redirect(w, r, "/", 302)
}
