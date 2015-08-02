package main

import (
	"net/http"

	"bbhoi.com/response"
	"bbhoi.com/store"

	"github.com/gorilla/context"
)

// middleware that restricts access to admins only
func adminMiddleware(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	user := store.CurrentUser(r)
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
		switch r.FormValue("type") {
		case "setAdmin":
			store.SetAdmin(w, r)
		case "unsetAdmin":
			store.UnsetAdmin(w, r)
		default:
			response.ClientError(w, http.StatusBadRequest)
		}
	case "GET":
		switch r.FormValue("type") {
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
		switch r.FormValue("type") {
		case "setFeaturedProject":
			SetFeaturedProject(w, r)
		case "unsetFeaturedProject":
			UnsetFeaturedProject(w, r)
		default:
			response.ClientError(w, http.StatusBadRequest)
		}
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}
