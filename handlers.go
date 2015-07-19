package main

import (
	"net/http"
	"strconv"
	"strings"
	"bbhoi.com/config"
	"bbhoi.com/response"
	"bbhoi.com/session"
	"bbhoi.com/store"
)

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
// /user/totd
// 
// GET: retrieve user's tasks of the day
// 
func userTOTD(w http.ResponseWriter, r *http.Request) {
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	switch r.Method {
	case "GET":
		count, err := strconv.ParseInt(r.FormValue("count"), 10, 0)
		if err != nil {
			response.ClientError(w, http.StatusBadRequest)
			return
		}
		response.OK(w, user.GetTasksOfTheDay(count))
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
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

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
		projectID, err := strconv.ParseInt(r.FormValue("projectID"), 10, 0)
		if err != nil {
			response.ClientError(w, http.StatusBadRequest)
			return
		}

		project, err := user.GetCompleteProject(projectID)
		if err != nil {
			response.ServerError(w, err)
			return
		}
		response.OK(w, project)
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

	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	projectID, err := strconv.ParseInt(r.FormValue("projectID"), 10, 0)
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if err = user.JoinProject(projectID); err != nil {
		response.ServerError(w, err)
		return
	}
}

// 
// /project/staffpick
// 
// GET: retrieve projects that have been personally picked by OI staffs
// 
func projectStaffPick(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		response.ClientError(w, http.StatusMethodNotAllowed)
		return
	}

	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	count, err := strconv.ParseInt(r.FormValue("count"), 10, 0)
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	projects, err := store.StaffPickedProjects(count)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, projects)
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

	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
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

	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
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

	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
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
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

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
// /project/member
// 
// GET: retrieve members of the project
// 
func projectMember(w http.ResponseWriter, r *http.Request) {
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	switch r.Method {
	case "GET":
		projectID, err := strconv.ParseInt(r.FormValue("projectID"), 10, 0)
		if err != nil {
			response.ClientError(w, http.StatusBadRequest)
			return
		}

		response.OK(w, store.GetProjectMembers(projectID, "accepted"))
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

// 
// /comment
// 
// GET: retrieve comments of a project or a task
// POST: create a new comment on projects or tasks
// 
func comment(w http.ResponseWriter, r *http.Request) {
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	switch r.Method {
	case "POST":
		sourceID, err := strconv.ParseInt(r.FormValue("sourceID"), 10, 0)
		if err != nil {
			response.ClientError(w, http.StatusBadRequest)
			return
		}

		sourceType := r.FormValue("sourceType")
		text := r.FormValue("text")

		if err = user.PostComment(sourceID, sourceType, text); err != nil {
			response.ServerError(w, err)
			return
		}

		response.OK(w, store.GetComments(sourceID, sourceType))
	case "GET":
		sourceID, err := strconv.ParseInt(r.FormValue("sourceID"), 10, 0)
		if err != nil {
			response.ClientError(w, http.StatusBadRequest)
			return
		}

		typ := r.FormValue("type")
		sourceType := r.FormValue("sourceType")

		if typ == "user" {
			response.OK(w, store.GetCommentsWithUser(sourceID, sourceType))
			return
		}
		response.OK(w, store.GetComments(sourceID, sourceType))
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /project/milestone
// 
// GET: update milestone in a project
// POST: insert / update milestone in a project
// DELETE: delete milestone in a project
// 
func projectMilestone(w http.ResponseWriter, r *http.Request) {
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	switch r.Method {
	case "POST":
		milestoneID, err := strconv.ParseInt(r.FormValue("milestoneID"), 10, 0)
		if err != nil {
			response.ClientError(w, http.StatusBadRequest)
			return
		}

		title := r.FormValue("title")
		description := r.FormValue("description")
		deadline := r.FormValue("deadline")

		if milestoneID == -1 {
			projectID, err := strconv.ParseInt(r.FormValue("projectID"), 10, 0)
			if err != nil {
				response.ClientError(w, http.StatusBadRequest)
				return
			}

			if err = store.InsertMilestone(projectID, title, description, deadline); err != nil {
				response.ServerError(w, err)
				return
			}
		} else {
			if err = store.UpdateMilestone(milestoneID, title, description, deadline); err != nil {
				response.ServerError(w, err)
				return
			}
		}

		response.OK(w, milestoneID)
	case "DELETE":
		milestoneID, err := strconv.ParseInt(r.FormValue("milestoneID"), 10, 0)
		if err != nil {
			response.ClientError(w, http.StatusBadRequest)
			return
		}

		if err := store.DeleteMilestone(milestoneID); err != nil {
			response.ServerError(w, err)
			return
		}

		response.OK(w, nil)
	case "GET":
		projectID, err := strconv.ParseInt(r.FormValue("projectID"), 10, 0)
		if err != nil {
			response.ClientError(w, http.StatusBadRequest)
			return
		}

		response.OK(w, store.GetMilestones(projectID))
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /project/task
// 
// GET: retrieve an existing task
// PUT: update an existing task
// POST: create a new task
// DELETE: delete an existing task
// 
func projectTask(w http.ResponseWriter, r *http.Request) {
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	var sourceID int64
	var err error

	switch r.Method {
	case "POST":
		taskID, err := user.CreateTask(r)
		if err != nil {
			response.ServerError(w, err)
			return
		}
		response.OK(w, taskID)
	case "PUT":
		taskID, err := user.UpdateTask(r)
		if err != nil {
			response.ServerError(w, err)
			return
		}
		response.OK(w, store.GetTask(taskID))
	case "GET":
		switch r.FormValue("type") {
		case "user":
			response.OK(w, user.GetTasks())
		case "project":
			if sourceID, err = strconv.ParseInt(r.FormValue("projectID"), 10, 0); err != nil {
				response.ClientError(w, http.StatusBadRequest)
				return
			}
			response.OK(w, store.GetTasks(sourceID))
		default:
			var count int64
			if count, err = strconv.ParseInt(r.FormValue("count"), 10, 0); err != nil {
				response.ClientError(w, http.StatusBadRequest)
				return
			}
			response.OK(w, store.GetLatestTasks(count))
		}
	case "DELETE":
		if err := user.DeleteTask(r); err != nil {
			response.ServerError(w, err)
			return
		}
		response.OK(w, nil)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /project/task/accept
// 
// POST: allow project members to accept tasks
// 
func taskAccept(w http.ResponseWriter, r *http.Request) {
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	switch r.Method {
	case "POST":
		if err := user.AcceptTask(r); err != nil {
			response.ServerError(w, err)
			return
		}

		response.OK(w, nil)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /project/task/assign
// 
// POST: allow author to assign task to project members
// 
func taskAssign(w http.ResponseWriter, r *http.Request) {
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	switch r.Method {
	case "POST":
		if err := user.AssignTask(r); err != nil {
			response.ServerError(w, err)
			return
		}
		response.OK(w, nil)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /project/task/categories
// 
// GET: retrieve (popular) task categories
// 
func taskCategories(w http.ResponseWriter, r *http.Request) {
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	switch r.Method {
	case "GET":
		switch r.FormValue("type") {
		case "popular":
			cs, err := store.PopularTaskCategories()
			if err != nil {
				response.ServerError(w, err)
				return
			}
			response.OK(w, cs)
		}
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}

// 
// /task/doer
// 
// POST: insert a task doer
// DELETE: delete a task doer
// 
func taskDoer(w http.ResponseWriter, r *http.Request) {
	user := session.GetUser(r)
	if !user.Exists() {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	var taskID, doerID int64
	var err error

	if taskID, err = strconv.ParseInt(r.FormValue("taskID"), 10, 0); err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if doerID, err = strconv.ParseInt(r.FormValue("doerID"), 10, 0); err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	switch r.Method {
	case "POST":
		var id int64
		if id, err = store.InsertDoer(taskID, doerID); err != nil {
			response.ServerError(w, err)
			return
		}

		response.OK(w, id)
	case "DELETE":
		if err = store.DeleteDoer(taskID, doerID); err != nil {
			response.ServerError(w, err)
			return
		}
		response.OK(w, nil)
	default:
		response.ClientError(w, http.StatusMethodNotAllowed)
	}
}
