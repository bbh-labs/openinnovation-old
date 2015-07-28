package store

import (
	"database/sql"
	"fmt"
	"math/rand"
	"net/http"
	"net/mail"
	"net/smtp"
	"strings"

	"bbhoi.com/config"
	"bbhoi.com/debug"
	"bbhoi.com/response"
	"golang.org/x/crypto/bcrypt"
)

const (
	preamble = `
	Welcome to BBH Open Innovation!

	Please click the link below to activate your account.
	`
)

func Register(w http.ResponseWriter, r *http.Request) {
	// check if user already exists
	email := r.FormValue("email")
	if hasUserWithEmail(email) {
		response.OK(w, "User already registered!")
		return
	}

	// check if email is from BBH
	if !((email == "aqiank@gmail.com" || email == "veeableful@gmail.com") || strings.HasSuffix(email, "@bartleboglehegarty.com")) {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	// check email and password length
	pass := r.FormValue("password")
	if len(email) < config.EmailLength() || len(pass) < config.PasswordLength() {
		response.ClientError(w, http.StatusBadRequest)
		  return
	}

	// register the user
	if err := register(email, pass, email, "", "", ""); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, "Successfully registered! Sent verification code to your email.")
}

func register(email, password, fullname, title, description, avatarURL string) error {
	var hpassword []byte
	var err error

	// generate salted and hashed password
	if hpassword, err = bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost); err != nil {
		return debug.Error(err)
	}

	// generate verification code
	verificationCode := generateVerificationCode()

	// insert user to database
	if err := insertUser(map[string]string{
		"email": email,
		"password": string(hpassword),
		"fullname": fullname,
		"title": title,
		"description": description,
		"avatarURL": avatarURL,
		"verificationCode": verificationCode,
	}); err != nil {
		return debug.Error(err)
	}

	// FIXME: send verification email
	// if err := sendVerificationEmail(email, verificationCode); err != nil {
	// 	return debug.Error(err)
	// }

	return nil
}

// Generate 64-character verification code from lowercase and uppercase characters
func generateVerificationCode() string {
	const list = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

	var code [64]byte
	for k, _ := range code {
		idx := rand.Intn(len(list))
		code[k] = list[idx]
	}

	return string(code[:])
}

// Send verification URL to the registered user
func sendVerificationEmail(email, code string) error {
	auth := smtp.PlainAuth(
		"",
		config.EmailAddress(),
		config.EmailPassword(),
		"smtp.gmail.com",
	)

	// Prepare addresses
	from := mail.Address{Name: config.EmailName(), Address: config.EmailAddress()}
	to := mail.Address{Name: "", Address: email}

	// Prepare header
	header := make(map[string]string)
	header["From"] = from.String()
	header["To"] = to.String()
	header["Subject"] = "Account Verification"
	header["Content-Type"] = "text/plain; charset=\"utf-8\""
	message := ""
	for k, v := range header {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}

	// Prepare body with link to verify
	body := preamble + "http://" + config.Hostname() + ":" + config.Port() + "/verify?" + "email=" + email + "&verificationCode=" + code
	message += "\r\n" + body

	// Send email
	if err := smtp.SendMail(config.EmailServerAddress(), auth, config.EmailAddress(), []string{email}, []byte(message)); err != nil {
		return debug.Error(err)
	}

	return nil
}

func hasUserWithEmail(email string) bool {
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
	INSERT INTO user_ (email, password, fullname, title, description, avatar_url, interests, verification_code, is_admin, updated_at, created_at)
	VALUES ($1, $2, $3, $4, $5, $6, '{"test"}', $7, FALSE, now(), now())`

	if _, err := db.Exec(q,
		m["email"],
		m["password"],
		m["fullname"],
		m["title"],
		m["description"],
		m["avatarURL"],
		"verified",
		//FIXME: m["verificationCode"],
	); err != nil {
		return debug.Error(err)
	}

	return nil
}

