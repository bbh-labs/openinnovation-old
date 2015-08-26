package store

import (
	"database/sql"

	"github.com/bbhasiapacific/openinnovation/debug"
	"golang.org/x/crypto/bcrypt"
)

func ValidLogin(email, password string) (bool, error) {
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
		&u.VerificationCode,
		&u.IsAdmin_,
		&u.UpdatedAt,
		&u.CreatedAt,
	); err != nil {
		if err != sql.ErrNoRows {
			debug.Error(err)
			return false, err
		} else {
			err = nil
		}
	}

	if bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)) != nil || u.VerificationCode != "verified" {
		return false, nil
	}

	return true, nil
}
