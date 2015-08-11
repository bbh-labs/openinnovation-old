package main

import (
	"net/http"
	"strings"

	"github.com/bbhasiapacific/bbhoi.com/config"
	"github.com/bbhasiapacific/bbhoi.com/response"
	"github.com/bbhasiapacific/bbhoi.com/session"
	"github.com/bbhasiapacific/bbhoi.com/store"
	"github.com/google/google-api-go-client/plus/v1"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var conf = &oauth2.Config{
	ClientID:     "320643691401-5m3ipff7ghamacndnvipda0uqi3eranu.apps.googleusercontent.com",
	ClientSecret: "Eb6_-XWDGeO5NqD1snPkoGX6",
	RedirectURL:  config.URL(),
	Endpoint:     google.Endpoint,
}

// (unused)
// func Login(w http.ResponseWriter, r *http.Request) {
// 	t := r.FormValue("loginFrom")
// 	switch t {
// 	default:
// 		email := r.FormValue("email")
// 		pass := r.FormValue("password")
// 
// 		// check email and password length
// 		if len(email) < config.EmailLength() || len(pass) < config.PasswordLength() {
// 			response.ClientError(w, http.StatusBadRequest)
// 			return
// 		}
// 
// 		// check if email is from BBH
// 		if email != "aqiank@gmail.com" && email != "veeableful@gmail.com" {
// 			if !strings.HasSuffix(email, "@bartleboglehegarty.com") {
// 				response.ClientError(w, http.StatusUnauthorized)
// 				return
// 			}
// 		}
// 
// 		// check if email and password are valid
// 		if valid, err := store.ValidLogin(email, pass); err != nil {
// 			response.ServerError(w, err)
// 			return
// 		} else if !valid {
// 			response.ClientError(w, http.StatusUnauthorized)
// 			return
// 		}
// 
// 		// start login session
// 		session.Set(w, r, email)
// 	}
// 
// 	user := store.CurrentUser(r)
// 	if !user.Exists() {
// 		response.ClientError(w, http.StatusForbidden)
// 		return
// 	}
// 
// 	response.OK(w, user)
// }

func Login(w http.ResponseWriter, r *http.Request) {
	// Your credentials should be obtained from the Google
	// Developer Console (https://console.developers.google.com).

	authCode := r.FormValue("code")
	tok, err := conf.Exchange(oauth2.NoContext, authCode)
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	loginGoogle(w, r, conf, tok)
}

func loginGoogle(w http.ResponseWriter, r *http.Request, conf *oauth2.Config, tok *oauth2.Token) {
	client := conf.Client(oauth2.NoContext, tok)
	service, err := plus.New(client)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	call := service.People.Get("me")
	person, err := call.Do()
	if err != nil {
		response.ServerError(w, err)
		return
	}

	email := ""
	for _, em := range person.Emails {
		if em.Type == "account" {
			email = em.Value
			break
		}
	}

	if !strings.HasSuffix(email, "@bartleboglehegarty.com") && email != "aqiank@gmail.com" {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	if store.HasUserWithEmail(email) {
		loginSuccess(w, r, email)
		return
	}

	firstname := person.Name.GivenName
	lastname := person.Name.FamilyName
	description := person.AboutMe
	imageURL := ""

	if !person.Image.IsDefault {
		imageURL = person.Image.Url
		if idx := strings.LastIndexFunc(
			imageURL,
			func(r rune) bool {
				return r == '?'
			},
		); idx >= 0 {
			imageURL = imageURL[:idx]
		}
	}

	fullname := firstname
	if lastname != "" {
		fullname += " " + lastname
	}

	if err := store.Register(email, "", fullname, "", description, imageURL); err != nil {
		response.ServerError(w, err)
		return
	}

	loginSuccess(w, r, email)
}

func loginSuccess(w http.ResponseWriter, r *http.Request, email string) {
	session.Set(w, r, email)

	user := store.CurrentUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	response.OK(w, user)
}
