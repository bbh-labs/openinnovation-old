package store

import (
	"database/sql"

	"github.com/bbhasiapacific/openinnovation/debug"
	"golang.org/x/crypto/bcrypt"
)

const (
	preamble = `
	Welcome to BBH Open Innovation!

	Please click the link below to activate your account.
	`
)

func Register(email, password, fullname, title, description, avatarURL string) error {
	var hpassword []byte
	var err error

	// generate salted and hashed password
	if hpassword, err = bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost); err != nil {
		return debug.Error(err)
	}

	// insert user to database
	if err := insertUser(map[string]string{
		"email":            email,
		"password":         string(hpassword),
		"fullname":         fullname,
		"title":            title,
		"description":      description,
		"avatarURL":        avatarURL,
		"verificationCode": "verified",
	}); err != nil {
		return debug.Error(err)
	}

	return nil
}

func HasUserWithEmail(email string) bool {
	const rawSQL = `SELECT COUNT(*) FROM user_ WHERE email = $1`

	var count int64
	if err := db.QueryRow(rawSQL, email).Scan(&count); err != nil {
		if err != sql.ErrNoRows {
			debug.Warn(err)
		}
		return false
	}
	return count > 0
}

func insertUser(m map[string]string) error {
	const q = `
	INSERT INTO user_ (email, password, fullname, title, description, avatar_url, verification_code, is_admin, updated_at, created_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, now(), now())`

	if _, err := db.Exec(q,
		m["email"],
		m["password"],
		m["fullname"],
		m["title"],
		m["description"],
		m["avatarURL"],
		"verified",
	); err != nil {
		return debug.Error(err)
	}

	return nil
}
