package main

import (
	"net/http"
	"strings"

	"bbhoi.com/response"
	"bbhoi.com/session"
	"bbhoi.com/store"

	"github.com/gorilla/context"
)

// middleware that restricts access to users only
func apiMiddleware(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	user := store.CurrentUser(r)
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
		store.Login(w, r)
	case "GET":
		response.OK(w, store.CurrentUser(r))
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /logout
// 
// POST: logs a user out
// 
func logout(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		session.Clear(w, r)
		response.OK(w, "Successfully logged out.")
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /register
// 
// POST: register a user
// 
func register(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		store.Register(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /verify
// 
// GET: verify a user
// 
func verify(w http.ResponseWriter, r *http.Request) {
	store.Verify(w, r)
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
		typ := r.FormValue("type")
		switch typ {
		case "featured":
			store.FeaturedProjects(w, r)
		case "latest":
			store.LatestProjects(w, r)
		default:
			user.GetProject(w, r)
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
	switch r.Method {
	case "POST":
		user := context.Get(r, "user").(store.User)
		user.JoinProject(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

//
// /task
//
// GET: get tasks
//
func task(w http.ResponseWriter, r *http.Request) {
	user := context.Get(r, "user").(store.User)

	switch r.Method {
	case "GET":
		typ := r.FormValue("type")
		switch typ {
		case "project":
			store.GetTasks(w, r)
		case "latest":
			store.LatestTasks(w, r)
		default:
			store.GetTask(w, r)
		}
	case "POST":
		user.CreateTask(w, r)
	case "PUT":
		user.UpdateTask(w, r)
	case "DELETE":
		user.DeleteTask(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

//
// /member
//
// GET: get project members
//
func member(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		store.GetMembers(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}
