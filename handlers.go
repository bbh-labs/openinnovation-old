package main

import (
	"net/http"
	"strconv"
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
	if user.Exists() {
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
// /user/mostactive
// 
// retrieve the most active users
// 
func mostActiveUsers(w http.ResponseWriter, r *http.Request) {
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	switch r.Method {
	case "GET":
		count, err := strconv.ParseInt(r.FormValue("count"), 10, 0)
		if err != nil {
			response.ServerError(w, err)
			return
		}

		var users []store.User
		if users, err = store.MostActiveUsers(count); err != nil {
			response.ServerError(w, err)
			return
		}

		response.OK(w, users)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /user
// 
// GET: retrieve the user's profile information
// PUT: update the user's profile information
// 
func _user(w http.ResponseWriter, r *http.Request) {
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	switch r.Method {
	case "PUT":
		if r.FormValue("type") == "interests" {
			interests := r.FormValue("interests")
			if err := user.UpdateInterests(interests); err != nil {
				response.ServerError(w, err)
				return
			}
		} else {
			name := r.FormValue("name")
			title := r.FormValue("title")
			description := r.FormValue("description")
			if err := user.Update(name, title, description); err != nil {
				response.ServerError(w, err)
				return
			}
		}
		response.OK(w, store.GetUser(user.ID()))
	case "GET":
		userID, err := strconv.ParseInt(r.FormValue("userID"), 10, 0)
		if err != nil {
			response.ClientError(w, http.StatusBadRequest)
			return
		}
		response.OK(w, store.GetUser(userID))
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
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	switch r.Method {
	case "POST":
		header, err := user.SaveAvatar(w, r)
		if err != nil {
			response.ServerError(w, err)
			return
		}
		if header == nil {
			response.ClientError(w, http.StatusBadRequest)
			return
		}
		response.OK(w, nil)
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
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	switch r.Method {
	case "GET":
		var userID int64
		var err error

		userIDStr := r.FormValue("userID")
		if userIDStr != "" {
			userID, err = strconv.ParseInt(userIDStr, 10, 0)
			if err != nil {
				response.ClientError(w, http.StatusBadRequest)
				return
			}
			user = store.GetUser(userID)
		}

		var ps []store.Project
		switch r.FormValue("type") {
		case "involved":
			ps, err = user.InvolvedProjects()
		case "completed":
			ps, err = user.CompletedProjects()
		default:
			ps, err = user.CreatedProjects()
		}

		if err != nil {
			response.ServerError(w, err)
			return
		}
		response.OK(w, ps)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /user/skill
// 
// GET: retrieve the user's skill information
// 
func userSkill(w http.ResponseWriter, r *http.Request) {
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	switch r.Method {
	case "GET":
		var userID int64
		var err error

		userIDStr := r.FormValue("userID")
		if userIDStr != "" {
			userID, err = strconv.ParseInt(userIDStr, 10, 0)
			if err != nil {
				response.ClientError(w, http.StatusBadRequest)
				return
			}
			user = store.GetUser(userID)
		}

		skills, err := user.Skills()
		if err != nil {
			response.ServerError(w, err)
			return
		}

		response.OK(w, skills)
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
		projectID, err := user.CreateProject(w, r)
		if err != nil {
			response.ServerError(w, err)
			return
		}
		if projectID == 0 {
			response.ClientError(w, http.StatusBadRequest)
			return
		}
		response.OK(w, projectID)
	case "PUT":
		if err := user.UpdateProject(w, r); err != nil {
			response.ServerError(w, err)
			return
		}
		response.OK(w, "Successfully updated the project")
	case "GET":
		typ := r.FormValue("searchType")
		switch typ {
		case "featured":
			featuredProjects(w, r)
		default:
			response.ClientError(w, http.StatusBadRequest)
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

	projectID, err := strconv.ParseInt(r.FormValue("projectID"), 10, 0)
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	if err = user.JoinProject(projectID); err != nil {
		response.ServerError(w, err)
		return
	}
}

// 
// /project/latest
// 
// GET: retrieve the latest projects
// 
func projectLatest(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		response.ClientError(w, http.StatusMethodNotAllowed)
		return
	}

	count, err := strconv.ParseInt(r.FormValue("count"), 10, 0)
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	projects, err := store.LatestProjects(count)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, projects)
}

// 
// /project/completed
// 
// GET: retrieve completed projects
// 
func projectCompleted(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		response.ClientError(w, http.StatusMethodNotAllowed)
		return
	}

	count, err := strconv.ParseInt(r.FormValue("count"), 10, 0)
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	projects, err := store.CompletedProjects(count)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, projects)
}

// 
// /project/trending
// 
// GET: retrieve trending projects
// 
func projectTrending(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		response.ClientError(w, http.StatusMethodNotAllowed)
		return
	}

	count, err := strconv.ParseInt(r.FormValue("count"), 10, 0)
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	projects, err := store.TrendingProjects(count)
	if err != nil {
		response.ServerError(w, err)
	}

	response.OK(w, projects)
}

// 
// /project/mostviewed
// 
// GET: retrieve most viewed projects
// 
func projectMostViewed(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		count, err := strconv.ParseInt(r.FormValue("count"), 10, 0)
		if err != nil {
			response.ClientError(w, http.StatusBadRequest)
			return
		}

		projects, err := store.GetMostViewedProjects(count)
		if err != nil {
			response.ServerError(w, err)
			return
		}

		response.OK(w, projects)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /search
// 
// GET: retrieve projects or users that match the query
// 
func search(w http.ResponseWriter, r *http.Request) {
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	type searchResult struct {
		Projects []store.Project `json:"projects,omitempty"`
		Users    []store.User    `json:"users,omitempty"`
	}

	switch r.Method {
	case "GET":
		term := r.FormValue("s")

		projects, err := store.SearchProjects(term)
		if err != nil {
			response.ServerError(w, err)
			return
		}

		users, err := store.SearchUsers(term)
		if err != nil {
			response.ServerError(w, err)
			return
		}

		response.OK(w, searchResult{Projects: projects, Users: users})
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}
