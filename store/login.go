package store

import (
	"database/sql"
	"net/http"
	"strings"

	"bbhoi.com/config"
	"bbhoi.com/debug"
	"bbhoi.com/response"
	"bbhoi.com/session"
	"golang.org/x/crypto/bcrypt"
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
		if !(email != "aqiank@gmail.com" || email != "veeableful@gmail.com") {
			if !strings.HasSuffix(email, "@bartleboglehegarty.com") {
				response.ClientError(w, http.StatusUnauthorized)
				return
			}
		}

		// check if email and password are valid
		if valid, err := validLogin(email, pass); err != nil {
			response.ServerError(w, err)
			return
		} else if !valid {
			response.ClientError(w, http.StatusUnauthorized)
			return
		}

		// start login session
		session.Set(w, r, email)
	}

	user := CurrentUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	response.OK(w, user)
}

func validLogin(email, password string) (bool, error) {
	const q = `SELECT * FROM user_ WHERE email = $1`

	var u user
	if err := db.QueryRow(q, email).Scan(
		&u.ID_,
		&u.Email,
		&u.Password,
		&u.Fullname,
		&u.Title,
		&u.Description,
		&u.AvatarURL,
		&u.Interests,
		&u.VerificationCode,
		&u.IsAdmin_,
		&u.UpdatedAt,
		&u.CreatedAt,
	); err != nil {
		if err != sql.ErrNoRows {
			return false, debug.Error(err)
		} else {
			err = nil
		}
	}

	if bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)) != nil || u.VerificationCode != "verified" {
		return false, nil
	}

	return true, nil
}
