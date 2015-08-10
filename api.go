package main

import (
	"net/http"
	"strings"

	"github.com/bbhasiapacific/bbhoi.com/debug"
	"github.com/bbhasiapacific/bbhoi.com/response"
	"github.com/bbhasiapacific/bbhoi.com/session"
	"github.com/bbhasiapacific/bbhoi.com/store"

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
		case "image":
			UpdateAvatar(w, r)
		default:
			Update(w, r)
		}
	case "GET":
		switch r.FormValue("type") {
		case "all":
			GetAllUsers(w, r)
		default:
			GetUser(w, r)
		}
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
		case "related":
			RelatedTasks(w, r)
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

//
// /friend
//
func friend(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		GetFriends(w, r)
	case "POST":
		AddFriend(w, r)
	case "DELETE":
		RemoveFriend(w, r)
	}
}

//
// /chat
//
func chat(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		GetChats(w, r)
	case "POST":
		PostChat(w, r)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

//
// /ws
//
func ws(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		response.ClientError(w, http.StatusMethodNotAllowed)
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		debug.Warn(err)
		return
	}

	user := context.Get(r, "user").(store.User)
	c := &connection{send: make(chan []byte, 256), ws: ws, userID: user.ID()}
	h.register <- c

	c.writePump()
	//c.readPump()
}
