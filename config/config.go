package config

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/bbhasiapacific/bbhoi.com/debug"
)

type emailData struct {
	Name          string `json:"name"`
	Address       string `json:"address"`
	ServerAddress string `json:"server_address"`
	Password      string `json:"password"`
}

var config = struct {
	SiteTitle           string    `json:"site_title"`
	Tagline             string    `json:"tagline"`
	Hostname            string    `json:"hostname"`
	Port                string    `json:"port"`
	URL                 string    `json:"url"`
	EmailLength         int       `json:"email_length"`
	PasswordLength      int       `json:"password_length"`
	Email               emailData `json:"email"`
}{
	SiteTitle: "BBH OI",
	Tagline: "Lorem Ipsum Dolor Sit Amet Consectetur",
	Hostname: "localhost",
	Port: "8080",
	URL: "http://localhost:8080",
	EmailLength: 6,
	PasswordLength: 8,
	Email: emailData{
		"BBH Open Innovation",
		"bbh.openinnovation@gmail.com",
		"smtp.gmail.com:587",
		"Lion@123",
	},
}

func init() {
	file, err := os.Open("bbhoi.json")
	if err != nil {
		if !os.IsNotExist(err) {
			debug.Warn(err)
		}
		return
	}

	if err = json.NewDecoder(file).Decode(&config); err != nil {
		debug.Warn(err)
		return
	}

	fmt.Printf("%v\n", config)
}

func SiteTitle() string {
	return config.SiteTitle
}

func Tagline() string {
	return config.Tagline
}

func Hostname() string {
	return config.Hostname
}

func Port() string {
	return config.Port
}

func URL() string {
	return config.URL
}

func EmailLength() int {
	return config.EmailLength
}

func PasswordLength() int {
	return config.PasswordLength
}

func EmailName() string {
	return config.Email.Name
}

func EmailAddress() string {
	return config.Email.Address
}

func EmailServerAddress() string {
	return config.Email.ServerAddress
}

func EmailPassword() string {
	return config.Email.Password
}
