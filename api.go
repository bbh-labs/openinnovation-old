package main

import (
	"net/http"
	"strings"

	"bbhoi.com/config"
	"bbhoi.com/response"
	"bbhoi.com/session"
	"bbhoi.com/store"

	"github.com/gorilla/context"
)

// middleware that restricts access to users only
func apiMiddleware(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	user := session.GetUser(r)
	if user != nil && user.Exists() {
		context.Set(r, "user", user)
		next(w, r)
	} else {
		response.ClientError(w, http.StatusForbidden)
	}
}

// 
// /
// 
// GET: loads the main HTML page and other resources
// 
func index(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		response.ClientError(w, http.StatusMethodNotAllowed)
	}

	if r.URL.Path == "/" {
		http.ServeFile(w, r, "index.html")
	} else if strings.IndexRune(r.URL.Path, '.') >= 0 {
		http.ServeFile(w, r, r.URL.Path[1:])
	}
}

// 
// /login
// 
// GET: retrieve the user's login state and respond with the user's data
// POST: logs a user in and respond with the user's data
// 
func login(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		t := r.FormValue("loginFrom")
		switch t {
		default:
			email := r.FormValue("email")
			pass := r.FormValue("password")

			// check if email is from BBH
			if !(email != "aqiank@gmail.com" || email != "veeableful@gmail.com") {
				if !strings.HasSuffix(email, "@bartleboglehegarty.com") {
					response.ClientError(w, http.StatusBadRequest)
					return
				}
			}

			// check email and password length
			if len(email) < config.EmailLength() || len(pass) < config.PasswordLength() {
				response.ClientError(w, http.StatusBadRequest)
				return
			}

			// check if email and password are valid
			if valid, err := store.ValidLogin(email, pass); err != nil {
				response.ServerError(w, err)
				return
			} else if !valid {
				response.ClientError(w, http.StatusBadRequest)
				return
			}

			// start login session
			session.Set(w, r, email)
		}
	case "GET":
		// nothing to do
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}

	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}
	response.OK(w, user)
}

// 
// /logout
// 
// POST: logs a user out
// 
func logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		response.ClientError(w, http.StatusMethodNotAllowed)
		return
	}

	session.Clear(w, r)
	response.OK(w, "Successfully logged out.")
}

// 
// /register
// 
// POST: register a user
// 
func register(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		response.ClientError(w, http.StatusMethodNotAllowed)
		return
	}

	// check if user already exists
	email := r.FormValue("email")
	if store.HasUserWithEmail(email) {
		response.OK(w, "User already registered!")
		return
	}

	// check if email is from BBH
	if !(email != "aqiank@gmail.com" || email != "veeableful@gmail.com") {
		if !strings.HasSuffix(email, "@bartleboglehegarty.com") {
			response.ClientError(w, http.StatusBadRequest)
			return
		}
	}

	// check email and password length
	pass := r.FormValue("password")
	if len(email) < config.EmailLength() || len(pass) < config.PasswordLength() {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	// register the user
	if err := store.Register(email, pass, email, "", "", ""); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, "Successfully registered! Sent verification code to your email.")
}

// 
// /verify
// 
// GET: verify a user
// 
func verify(w http.ResponseWriter, r *http.Request) {
	email := r.FormValue("email")
	code := r.FormValue("verificationCode")

	verified := store.IsUserVerified(email)
	if verified {
		response.OK(w, "Already verified!")
		return
	}

	valid := store.ValidVerificationCode(email, code)
	if !valid {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if err := store.VerifyUser(email); err != nil {
		response.ServerError(w, err)
		return
	}

	http.Redirect(w, r, "/", 302)
}

// 
// /user
// 
// GET: retrieve the user's profile information
// PUT: update the user's profile information
// 
func user(w http.ResponseWriter, r *http.Request) {
	user := context.Get(r, "user").(store.User)

	switch r.Method {
	case "PUT":	
		switch r.FormValue("type") {
		case "interests":
			user.UpdateInterests(w, r)
		default:
			user.Update(w, r)
		}
	case "GET":
		store.GetUser(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /user/image
// 
// POST: update the user's profile picture
// 
func userImage(w http.ResponseWriter, r *http.Request) {
	user := context.Get(r, "user").(store.User)

	switch r.Method {
	case "POST":
		user.SaveAvatar(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /user/project
// 
// GET: retrieve the user's projects (involved, completed, all)
// 
func userProject(w http.ResponseWriter, r *http.Request) {
	user := context.Get(r, "user").(store.User)

	switch r.Method {
	case "GET":
		switch r.FormValue("type") {
		case "involved":
			user.InvolvedProjects(w, r)
		case "completed":
			user.CompletedProjects(w, r)
		default:
			user.CreatedProjects(w, r)
		}
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /project
// 
// POST: create a new project
// PUT: update an existing project
// GET: get a project's information
// 
func project(w http.ResponseWriter, r *http.Request) {
	user := context.Get(r, "user").(store.User)

	switch r.Method {
	case "POST":
		user.CreateProject(w, r)
	case "PUT":
		user.UpdateProject(w, r)
	case "GET":
		typ := r.FormValue("searchType")
		switch typ {
		case "featured":
			store.FeaturedProjects(w, r)
		case "latest":
			store.LatestProjects(w, r)
		default:
			store.GetCompleteProject(w, r)
		}
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /project/join
// 
// POST: send a join project request
// 
func projectJoin(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		response.ClientError(w, http.StatusMethodNotAllowed)
		return
	}

	user := context.Get(r, "user").(store.User)
	user.JoinProject(w, r)
}
