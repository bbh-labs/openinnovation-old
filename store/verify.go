package store

import (
	"database/sql"

	"bbhoi.com/debug"
)

func VerifyUser(email string) error {
	const q = `UPDATE user_ SET verificationCode = 'verified' WHERE email = $1`

	if _, err := db.Exec(q, email); err != nil {
		return debug.Error(err)
	}
	return nil
}

func IsUserVerified(email string) bool {
	const q = `SELECT COUNT(*) FROM user_ WHERE email = $1 AND verificationCode = 'verified'`

	var count int64
	if err := db.QueryRow(q, email).Scan(&count); err != nil {
		if err != sql.ErrNoRows {
			debug.Warn(err)
		}
		return false
	}
	return count > 0
}

func ValidVerificationCode(email, code string) bool {
	const q = `SELECT COUNT(*) FROM user_ WHERE email = $1 AND verificationCode = $2`

	var count int64
	if err := db.QueryRow(q, email, code).Scan(&count); err != nil {
		if err != sql.ErrNoRows {
			debug.Warn(err)
		}
		return false
	}
	return count > 0
}
