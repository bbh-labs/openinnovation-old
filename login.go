package main

import (
	"flag"
	"net/http"
	"strings"

	"github.com/bbhasiapacific/openinnovation/response"
	"github.com/bbhasiapacific/openinnovation/session"
	"github.com/bbhasiapacific/openinnovation/store"
	"github.com/google/google-api-go-client/plus/v1"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var redirectURL = flag.String("url", "http://localhost:8080", "Google OAuth2 redirect URL")

func Login(w http.ResponseWriter, r *http.Request) {
	var conf = &oauth2.Config{
		ClientID:     "320643691401-5m3ipff7ghamacndnvipda0uqi3eranu.apps.googleusercontent.com",
		ClientSecret: "Eb6_-XWDGeO5NqD1snPkoGX6",
		RedirectURL:  *redirectURL,
		Endpoint:     google.Endpoint,
	}

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
