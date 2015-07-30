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
func verify(w http.ResponseWriter, r *http.Request) {
	store.Verify(w, r)
}

// 
// /user
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
func project(w http.ResponseWriter, r *http.Request) {
	user := context.Get(r, "user").(store.User)

	switch r.Method {
	case "POST":
		user.CreateProject(w, r)
	case "PUT":
		user.UpdateProject(w, r)
	case "DELETE":
		user.DeleteProject(w, r)
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
func task(w http.ResponseWriter, r *http.Request) {
	user := context.Get(r, "user").(store.User)

	switch r.Method {
	case "GET":
		switch r.FormValue("type") {
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
		switch r.FormValue("type") {
		case "toggleStatus":
			user.ToggleTaskStatus(w, r)
		default:
			user.UpdateTask(w, r)
		}
	case "DELETE":
		user.DeleteTask(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

//
// /member
//
func member(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		store.GetMembers(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

//
// /worker
//
func worker(w http.ResponseWriter, r *http.Request) {
	user := context.Get(r, "user").(store.User)

	switch r.Method {
	case "GET":
		store.GetWorkers(w, r)
	case "POST":
		user.AssignWorker(w, r)
	case "DELETE":
		user.UnassignWorker(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}
