package store

import (
	"database/sql"
	"net/http"

	"bbhoi.com/debug"
	"bbhoi.com/response"
)

func Verify(w http.ResponseWriter, r *http.Request) {
	email := r.FormValue("email")
	code := r.FormValue("verificationCode")

	verified := isUserVerified(email)
	if verified {
		response.OK(w, "Already verified!")
		return
	}

	valid := validVerificationCode(email, code)
	if !valid {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if err := verifyUser(email); err != nil {
		response.ServerError(w, err)
		return
	}

	http.Redirect(w, r, "/", 302)
}

func verifyUser(email string) error {
	const q = `UPDATE user_ SET verification_code = 'verified' WHERE email = $1`

	if _, err := db.Exec(q, email); err != nil {
		return debug.Error(err)
	}
	return nil
}

func isUserVerified(email string) bool {
	const q = `SELECT COUNT(*) FROM user_ WHERE email = $1 AND verification_code = 'verified'`

	var count int64
	if err := db.QueryRow(q, email).Scan(&count); err != nil {
		if err != sql.ErrNoRows {
			debug.Warn(err)
		}
		return false
	}
	return count > 0
}

func validVerificationCode(email, code string) bool {
	const q = `SELECT COUNT(*) FROM user_ WHERE email = $1 AND verification_code = $2`

	var count int64
	if err := db.QueryRow(q, email, code).Scan(&count); err != nil {
		if err != sql.ErrNoRows {
			debug.Warn(err)
		}
		return false
	}
	return count > 0
}
