package main

import (
	"net/http"

	"bbhoi.com/response"
	"bbhoi.com/session"
	"bbhoi.com/store"

	"github.com/gorilla/context"
)

// middleware that restricts access to admins only
func adminMiddleware(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	user := session.GetUser(r)
	if user.Exists() && user.IsAdmin() {
		context.Set(r, "user", user)
		next(w, r)
	} else {
		response.ClientError(w, http.StatusForbidden)
	}
}

// 
// /api/admin/user
// 
// PUT: 
// GET: 
// 
func adminUser(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "PUT":
		switch r.FormValue("actionType") {
		case "setAdmin":
			store.SetAdmin(w, r)
		case "unsetAdmin":
			store.UnsetAdmin(w, r)
		default:
			response.ClientError(w, http.StatusBadRequest)
		}
	case "GET":
		switch r.FormValue("actionType") {
		default:
			store.GetAdmins(w, r)
		}
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /api/admin/project
// 
// POST: create a new project
// PUT: update an existing project
// GET: get a project's information
// 
func adminProject(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		switch r.FormValue("actionType") {
		case "setFeaturedProject":
			store.SetFeaturedProject(w, r)
		case "unsetFeaturedProject":
			store.UnsetFeaturedProject(w, r)
		default:
			response.ClientError(w, http.StatusBadRequest)
		}
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}
