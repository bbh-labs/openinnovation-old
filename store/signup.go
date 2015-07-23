package store

import (
	"fmt"
	"math/rand"
	"net/mail"
	"net/smtp"

	"bbhoi.com/config"
	"bbhoi.com/debug"
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

	// generate verification code
	verificationCode := generateVerificationCode()

	// insert user to database
	if err := error(insertUser(map[string]string{
		"email": email,
		"password": string(hpassword),
		"fullname": fullname,
		"title": title,
		"description": description,
		"avatarURL": avatarURL,
		"verificationCode": verificationCode,
	})); err != nil {
		return debug.Error(err)
	}

	if err := error(sendVerificationEmail(email, verificationCode)); err != nil {
		return debug.Error(err)
	}

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
