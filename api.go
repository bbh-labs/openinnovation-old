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
		Login(w, r)
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
		Register(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

//
// /verify
//
func verify(w http.ResponseWriter, r *http.Request) {
	Verify(w, r)
}

//
// /user
//
func user(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "PUT":
		switch r.FormValue("type") {
		case "interests":
			UpdateInterests(w, r)
		case "image":
			UpdateAvatar(w, r)
		default:
			Update(w, r)
		}
	case "GET":
		GetUser(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

//
// /user/project
//
func userProject(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		switch r.FormValue("type") {
		case "involved":
			InvolvedProjects(w, r)
		case "completed":
			CompletedProjects(w, r)
		default:
			CreatedProjects(w, r)
		}
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

//
// /project
//
func project(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		CreateProject(w, r)
	case "PUT":
		UpdateProject(w, r)
	case "DELETE":
		DeleteProject(w, r)
	case "GET":
		typ := r.FormValue("type")
		switch typ {
		case "featured":
			FeaturedProjects(w, r)
		case "latest":
			LatestProjects(w, r)
		default:
			GetProject(w, r)
		}
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

//
// /project/member
//
func member(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		GetMembers(w, r)
	case "POST":
		AddMember(w, r)
	case "DELETE":
		RemoveMember(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

//
// /task
//
func task(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		switch r.FormValue("type") {
		case "project":
			GetTasks(w, r)
		case "latest":
			LatestTasks(w, r)
		default:
			GetTask(w, r)
		}
	case "POST":
		CreateTask(w, r)
	case "PUT":
		switch r.FormValue("type") {
		case "toggleStatus":
			ToggleTaskStatus(w, r)
		default:
			UpdateTask(w, r)
		}
	case "DELETE":
		DeleteTask(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

//
// /task/worker
//
func worker(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		GetWorkers(w, r)
	case "POST":
		AssignWorker(w, r)
	case "DELETE":
		UnassignWorker(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

//
// /milestone
//
func milestone(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		switch r.FormValue("type") {
		case "project":
			GetMilestones(w, r)
		default:
			GetMilestone(w, r)
		}
	case "POST":
		CreateMilestone(w, r)
	case "PUT":
		UpdateMilestone(w, r)
	case "DELETE":
		DeleteMilestone(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}
