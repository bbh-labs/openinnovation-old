package store

import (
	"database/sql"

	"github.com/bbhmakerlab/openinnovation/debug"
)

func IsUserVerified(email string) bool {
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

func ValidVerificationCode(email, code string) bool {
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

func VerifyUser(email string) error {
	const q = `UPDATE user_ SET verification_code = 'verified' WHERE email = $1`

	if _, err := db.Exec(q, email); err != nil {
		return err
	}
	return nil
}
