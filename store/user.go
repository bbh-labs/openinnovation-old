package store

import (
	"database/sql"
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"
	"time"

	"bbhoi.com/debug"
	"bbhoi.com/httputil"
)

const (
	createUserSQL = `
	id bigserial PRIMARY KEY,
	email text NOT NULL,
	password text NOT NULL,
	fullname text NOT NULL,
	title text NOT NULL,
	description text NOT NULL,
	avatarURL TEXT NOT NULL,
	verificationCode text NOT NULL,
	createdAt timestamp NOT NULL`
)

type User interface {
	ID() int64
	Exists() bool
	Update(name, title, description string) error
	UpdateInterests(interests string) error
	SaveAvatar(w http.ResponseWriter, r *http.Request) (*multipart.FileHeader, error)

	CreatedProjects() ([]Project, error)
	InvolvedProjects() ([]Project, error)
	CompletedProjects() ([]Project, error)

	Skills() ([]int64, error)

	CreateProject(w http.ResponseWriter, r *http.Request) (int64, error)
	UpdateProject(w http.ResponseWriter, r *http.Request) error
	JoinProject(projectID int64) error

	GetCompleteProject(projectID int64) (Project, error)

	PostComment(sourceID int64, sourceType, text string) error

	CreateTask(r *http.Request) (int64, error)
	UpdateTask(r *http.Request) (int64, error)
	DeleteTask(r *http.Request) error
	GetTasks() []Task
	GetTasksOfTheDay(count int64) []Task
	AcceptTask(r *http.Request) error
	AssignTask(r *http.Request) error

	IsMember(projectID int64) bool
	IsAuthor(projectID int64) bool
}

type user struct {
	ID_              int64     `json:"id,omitempty"`
	Email            string    `json:"email,omitempty"`
	Password         string    `json:"-"`
	Fullname         string    `json:"fullname,omitempty"`
	Title            string    `json:"title,omitempty"`
	Description      string    `json:"description,omitempty"`
	AvatarURL        string    `json:"avatarURL,omitempty"`
	VerificationCode string    `json:"-"`
	CreatedAt        time.Time `json:"createdAt,omitempty"`

	CreatedProjectsCount_   int64 `json:"created_projects_count"`
	CompletedProjectsCount_ int64 `json:"completed_projects_count"`
	InvolvedProjectsCount_  int64 `json:"involved_projects_count"`
	CompletedTasksCount_    int64 `json:"completed_tasks_count"`

	MaxCreatedProjectsCount_   int64 `json:"max_created_projects_count"`
	MaxCompletedProjectsCount_ int64 `json:"max_completed_projects_count"`
	MaxInvolvedProjectsCount_  int64 `json:"max_involved_projects_count"`
	MaxCompletedTasksCount_    int64 `json:"max_completed_tasks_count"`
}

func (u user) ID() int64 {
	return u.ID_
}

func (u user) ShortDescription(n int) string {
	if n >= len(u.Description) {
		return u.Description
	}
	return u.Description[:n]
}

func (u user) ChangePassword(newpass string) error {
	return nil
}

func (u user) Exists() bool {
	return u.Email != ""
}

func HasUserWithEmail(email string) bool {
	const q = `SELECT COUNT(*) FROM user_ WHERE email = $1`

	var count int64
	if err := db.QueryRow(q, email).Scan(&count); err != nil {
		if err != sql.ErrNoRows {
			debug.Warn(err)
		}
		return false
	}
	return count > 0
}

func insertUser(email, hpassword, fullname, title, description, avatarURL, verificationCode string) error {
	const q = `
	INSERT INTO user_ (email, password, fullname, title, description, avatarURL, verificationCode, createdAt)
	VALUES ($1, $2, $3, $4, $5, $6, $7, now())`

	if _, err := db.Exec(q, email, hpassword, fullname, title, description, avatarURL, verificationCode); err != nil {
		return debug.Error(err)
	}

	return nil
}

func GetUser(data interface{}) User {
	var row *sql.Row
	switch t := data.(type) {
	case int64:
		row = db.QueryRow(`SELECT * FROM user_ WHERE id = $1`, t)
	case string:
		row = db.QueryRow(`SELECT * FROM user_ WHERE email = $1`, t)
	}

	u := user{}
	if err := row.Scan(
		&u.ID_,
		&u.Email,
		&u.Password,
		&u.Fullname,
		&u.Title,
		&u.Description,
		&u.AvatarURL,
		&u.VerificationCode,
		&u.CreatedAt,
	); err != nil && err != sql.ErrNoRows {
		debug.Warn(err)
		return u
	}

	return u
}

func SearchUsers(term string) ([]User, error) {
	const q = `SELECT * FROM user_ WHERE fullname LIKE $1`
	return queryUsers(q, "%"+term+"%")
}

func MostActiveUsers(count int64) ([]User, error) {
	const q = `SELECT * FROM user_ LIMIT $1`

	rows, err := db.Query(q, count)
	if err != nil {
		return nil, debug.Error(err)
	}
	defer rows.Close()

	var us []User
	for rows.Next() {
		var u user

		if err = rows.Scan(
			&u.ID_,
			&u.Email,
			&u.Password,
			&u.Fullname,
			&u.Title,
			&u.Description,
			&u.AvatarURL,
			&u.VerificationCode,
			&u.CreatedAt,
		); err != nil {
			return nil, debug.Error(err)
		}

		u.CreatedProjectsCount_ = u.CreatedProjectsCount()
		u.InvolvedProjectsCount_ = u.InvolvedProjectsCount()
		u.CompletedProjectsCount_ = u.CompletedProjectsCount()
		u.CompletedTasksCount_ = u.CompletedTasksCount()
		u.MaxCreatedProjectsCount_ = MaxCreatedProjectsCount()
		u.MaxInvolvedProjectsCount_ = MaxInvolvedProjectsCount()
		u.MaxCompletedProjectsCount_ = MaxCompletedProjectsCount()
		u.MaxCompletedTasksCount_ = MaxCompletedTasksCount()

		us = append(us, u)
	}

	return us, nil
}

func queryUsers(q string, data ...interface{}) ([]User, error) {
	rows, err := db.Query(q, data...)
	if err != nil {
		return nil, debug.Error(err)
	}
	defer rows.Close()

	var us []User
	for rows.Next() {
		var u user

		if err = rows.Scan(
			&u.ID_,
			&u.Email,
			&u.Password,
			&u.Fullname,
			&u.Description,
			&u.Title,
			&u.AvatarURL,
			&u.VerificationCode,
			&u.CreatedAt,
		); err != nil {
			return nil, debug.Error(err)
		}

		us = append(us, u)
	}

	return us, nil
}

func (u user) Update(name, title, description string) error {
	const q = `UPDATE user_ SET nicename = $1, title = $2, description = $3 WHERE id = $4`

	if _, err := db.Exec(q, name, title, description, u.ID_); err != nil {
		return debug.Error(err)
	}
	return nil
}

func (u user) UpdateInterests(interests string) error {
	const q = `UPDATE user_ SET interests = $1 WHERE id = $2`

	if _, err := db.Exec(q, interests, u.ID_); err != nil {
		return debug.Error(err)
	}
	return nil
}

func (u user) updateAvatarURL(url string) error {
	const q = `UPDATE user_ SET avatarURL = $1 WHERE id = $2`

	if _, err := db.Exec(q, url, u.ID_); err != nil {
		return debug.Error(err)
	}
	return nil
}

func (u user) CreatedProjects() ([]Project, error) {
	const q = `SELECT * FROM project WHERE authorID = $1`

	return queryProjectsWithMembers(q, u.ID_)
}

func (u user) InvolvedProjects() ([]Project, error) {
	const q = `
	SELECT project.* FROM project
	INNER JOIN member ON member.projectID = project.id
	WHERE member.userID = $1`

	return queryProjectsWithMembers(q, u.ID_)
}

func (u user) CompletedProjects() ([]Project, error) {
	const q = `
	SELECT project.* FROM project
	WHERE status = $1`

	return queryProjectsWithMembers(q, "completed")
}

func (u user) CreatedProjectsCount() int64 {
	const q = `SELECT COUNT(*) FROM project WHERE authorID = $1`

	return count(q, u.ID_)
}

func (u user) InvolvedProjectsCount() int64 {
	const q = `
	SELECT COUNT(project.*) FROM project
	INNER JOIN member ON member.projectID = project.id
	WHERE member.userID = $1`

	return count(q, u.ID_)
}

func (u user) CompletedProjectsCount() int64 {
	const q = `
	SELECT COUNT(project.*) FROM project
	WHERE status = 'completed' AND project.authorID = $1`

	return count(q, u.ID_)
}

func MaxCreatedProjectsCount() int64 {
	const q = `
	SELECT MAX(n) FROM (
		SELECT COUNT(*) AS n FROM project
		GROUP BY project.authorID
	) as n`

	return count(q)
}

func MaxInvolvedProjectsCount() int64 {
	const q = `
	SELECT MAX(n) FROM (
		SELECT COUNT(project.*) AS n FROM project
		INNER JOIN member ON member.projectID = project.id
		GROUP BY member.userID
	) as n`

	return count(q)
}

func MaxCompletedProjectsCount() int64 {
	const q = `
	SELECT MAX(n) FROM (
		SELECT COUNT(project.*) AS n FROM project
		WHERE status = 'completed
		GROUP BY project.authorID'
	) as n`

	return count(q)
}

func (u user) Skills() ([]int64, error) {
	const q = `SELECT
					(SELECT COUNT(*) FROM task WHERE category = "design"),
					(SELECT COUNT(*) FROM task WHERE category = "copywriting"),
					(SELECT COUNT(*) FROM task WHERE category = "art-direction"),
					(SELECT COUNT(*) FROM task WHERE category = "photography"),
					(SELECT COUNT(*) FROM task WHERE category = "filming"),
					(SELECT COUNT(*) FROM task WHERE category = "software"),
					(SELECT COUNT(*) FROM task WHERE category = "planning"),
					(SELECT COUNT(*) FROM task WHERE category = "management"),
					(SELECT COUNT(*) FROM task WHERE category = "marketing"),
					(SELECT COUNT(*) FROM task WHERE category = "pr"),
					(SELECT COUNT(*) FROM task WHERE category = "production"),
					(SELECT COUNT(*) FROM task WHERE category = "others")
			   FROM task
			   INNER JOIN doer ON task.id = doer.taskID
			   WHERE doer.userID = $1
			   GROUP BY category`

	var ss [12]int64

	if err := db.QueryRow(q, u.ID_).Scan(
		&ss[0],
		&ss[1],
		&ss[2],
		&ss[3],
		&ss[4],
		&ss[5],
		&ss[6],
		&ss[7],
		&ss[8],
		&ss[9],
		&ss[10],
		&ss[11],
	); err != nil && err != sql.ErrNoRows {
		return nil, debug.Error(err)
	}

	return ss[:], nil
}


func (u user) SaveAvatar(w http.ResponseWriter, r *http.Request) (*multipart.FileHeader, error) {
	url := fmt.Sprintf("oi-content/profile/img/%d/avatar.png", u.ID_)
	header, err := httputil.SaveFile(w, r, "image", url)
	if err != nil {
		return nil, debug.Error(err)
	}
	if header == nil {
		return nil, nil
	}
	if err = u.updateAvatarURL(url); err != nil {
		return header, err
	}
	return header, nil
}

func (u user) CreateProject(w http.ResponseWriter, r *http.Request) (int64, error) {
	title := r.FormValue("projectTitle")

	// title can't be empty
	if title == "" {
		return 0, nil
	}

	description := r.FormValue("projectDescription")

	// basic project info
	projectID, err := insertProject(u.ID_, title, description)
	if err != nil {
		return 0, debug.Error(err)
	}

	// set author
	authorProject(projectID, u.ID_)

	// cover image
	url := fmt.Sprintf("oi-content/project/img/%d/cover", projectID)
	header, err := httputil.SaveFileWithExtension(w, r, "cover", url)
	if err != nil {
		goto error
	}
	if header == nil {
		goto error
	}
	if err = updateProjectCover(projectID, url); err != nil {
		goto error
	}

	// intro video
	url = fmt.Sprintf("oi-content/project/img/%d/intro", projectID)
	if header, err = httputil.SaveFileWithExtension(w, r, "intro", url); err != nil {
		goto error
	}
	if header == nil {
		goto error
	}
	if err = updateProjectCover(projectID, url); err != nil {
		goto error
	}

	// milestones
	if err = error(InsertMilestones(projectID, r)); err != nil {
		goto error
	}

	return projectID, nil

error:
	if err2 := u.deleteProject(projectID); err2 != nil {
		debug.Warn(err2)
	}
	return 0, debug.Error(err)
}

func (u user) UpdateProject(w http.ResponseWriter, r *http.Request) error {
	title := r.FormValue("projectTitle")

	// title can't be empty
	if title == "" {
		return nil
	}

	description := r.FormValue("projectDescription")

	projectID, err := strconv.ParseInt(r.FormValue("projectID"), 10, 0)
	if err != nil {
		return debug.Error(err)
	}

	// basic project info
	if err = updateProject(projectID, title, description); err != nil {
		return debug.Error(err)
	}

	// cover image
	url := fmt.Sprintf("oi-content/project/img/%d/cover", projectID)
	header, err := httputil.SaveFileWithExtension(w, r, "cover", url)
	if err != nil {
		return debug.Error(err)
	}
	if header != nil {
		if err = updateProjectCover(projectID, url); err != nil {
			return debug.Error(err)
		}
	}

	// intro video
	url = fmt.Sprintf("oi-content/project/img/%d/intro", projectID)
	header, err = httputil.SaveFileWithExtension(w, r, "intro", url)
	if err != nil {
		return debug.Error(err)
	}
	if header != nil {
		if err = updateProjectCover(projectID, url); err != nil {
			return debug.Error(err)
		}
	}

	return nil
}

func (u user) deleteProject(projectID int64) error {
	const q = `
	DELETE FROM project WHERE id = $1`

	if _, err := db.Exec(q, projectID); err != nil {
		return debug.Error(err)
	}

	if err := deleteAllComments(projectID); err != nil {
		return debug.Error(err)
	}

	if err := deleteAllDoers(projectID); err != nil {
		return debug.Error(err)
	}

	if err := deleteAllMembers(projectID); err != nil {
		return debug.Error(err)
	}

	if err := deleteAllMilestones(projectID); err != nil {
		return debug.Error(err)
	}

	if err := deleteAllTasks(projectID); err != nil {
		return debug.Error(err)
	}

	if err := os.RemoveAll(fmt.Sprintf("oi-content/project/img/%d", projectID)); err != nil {
		return debug.Error(err)
	}
	return nil
}

func (u user) JoinProject(projectID int64) error {
	const q = `
	INSERT INTO members (projectID, userID, status)
	VALUES ($1, $2, $3)
	WHERE projectID = $4`

	if _, err := db.Exec(q, projectID, u.ID, "pending"); err != nil {
		return debug.Error(err)
	}
	return nil
}

func (u user) GetCompleteProject(projectID int64) (Project, error) {
	p, err := getProject(projectID)
	if err != nil {
		return p, err
	}

	p.Author = GetUser(p.AuthorID)
	p.Members = GetMembers(p.ID, "accepted")
	p.Comments = GetCommentsWithUser(p.ID, "project")
	p.Tasks = GetTasks(p.ID)
	p.Milestones = GetMilestones(p.ID)

	return p, nil
}

func (u user) PostComment(sourceID int64, sourceType, text string) error {
	if err := insertComment(u.ID_, sourceID, sourceType, text); err != nil {
		return debug.Error(err)
	}

	return nil
}

func (u user) CreateTask(r *http.Request) (int64, error) {
	sourceID, err := strconv.ParseInt(r.FormValue("sourceID"), 10, 0)
	if err != nil {
		return 0, debug.Error(err)
	}

	var milestoneID int64
	if milestoneID, err = strconv.ParseInt(r.FormValue("milestoneID"), 10, 0); err != nil {
		return 0, debug.Error(err)
	}

	title := r.FormValue("title")
	description := r.FormValue("description")
	category := r.FormValue("category")
	status := r.FormValue("status")
	startDateStr := r.FormValue("startDate")
	endDateStr := r.FormValue("endDate")

	taskID, err := insertTask(u.ID_, sourceID, milestoneID, title, description, category, status, startDateStr, endDateStr)
	if err != nil {
		return 0, debug.Error(err)
	}

	return taskID, nil
}

func (u user) UpdateTask(r *http.Request) (int64, error) {
	taskID, err := strconv.ParseInt(r.FormValue("taskID"), 10, 0)
	if err != nil {
		return 0, debug.Error(err)
	}

	var milestoneID int64
	if milestoneID, err = strconv.ParseInt(r.FormValue("milestoneID"), 10, 0); err != nil {
		return 0, debug.Error(err)
	}

	title := r.FormValue("title")
	description := r.FormValue("description")
	category := r.FormValue("category")
	status := r.FormValue("status")
	startDate := r.FormValue("startDate")
	endDate := r.FormValue("endDate")

	if err = error(updateTask(taskID, milestoneID, title, description, category, status, startDate, endDate)); err != nil {
		return 0, debug.Error(err)
	}

	return taskID, nil
}

func (u user) DeleteTask(r *http.Request) error {
	taskID, err := strconv.ParseInt(r.FormValue("taskID"), 10, 0)
	if err != nil {
		return debug.Error(err)
	}

	if err = deleteTask(taskID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func (u user) GetTasks() []Task {
	const q = `
	SELECT task.* FROM task
	INNER JOIN doer ON task.id = doer.taskID
	WHERE doer.userID = $1`

	return queryTasks(q, u.ID_)
}

func (u user) GetTasksOfTheDay(count int64) []Task {
	const q = `
	SELECT task.* FROM task
	INNER JOIN member ON member.projectID = task.sourceID
	WHERE task.status = 'todo' AND member.userID = $1
	LIMIT $2`

	return queryTasksWithProject(q, u.ID_, count)
}

func (u user) AcceptTask(r *http.Request) error {
	taskID, err := strconv.ParseInt(r.FormValue("taskID"), 10, 0)
	if err != nil {
		return debug.Error(err)
	}

	if _, err = InsertDoer(taskID, u.ID_); err != nil {
		return debug.Error(err)
	}
	return nil
}

func (u user) AssignTask(r *http.Request) error {
	taskID, err := strconv.ParseInt(r.FormValue("taskID"), 10, 0)
	if err != nil {
		return debug.Error(err)
	}

	if err = ClearDoers(taskID); err != nil {
		return debug.Error(err)
	}

	var userID int64
	for _, v := range r.Form["assignee"] {
		if userID, err = strconv.ParseInt(v, 10, 0); err != nil {
			return debug.Error(err)
		}
		if _, err = InsertDoer(taskID, userID); err != nil {
			return debug.Error(err)
		}
	}
	return nil
}

func (u user) CompletedTasksCount() int64 {
	const q = `
	SELECT COUNT(*) FROM tasks
	INNER JOIN doer ON doer.taskID = tasks.id
	WHERE tasks.status == "done" AND doer.userID = $1`

	return count(q, u.ID)
}

func MaxCompletedTasksCount() int64 {
	const q = `
	SELECT MAX(n) FROM (
		SELECT COUNT(*) AS n FROM tasks
		INNER JOIN doer ON doer.taskID = tasks.id
		WHERE tasks.status == "done"
		GROUP BY doer.userID
	) AS n`

	return count(q)
}

func (u user) IsMember(projectID int64) bool {
	return isMember(projectID, u.ID_)
}

func (u user) IsAuthor(projectID int64) bool {
	return isAuthor(projectID, u.ID_)
}
