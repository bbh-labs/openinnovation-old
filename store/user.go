package store

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/bbhmakerlab/openinnovation/debug"
	"github.com/bbhmakerlab/openinnovation/response"
	"github.com/bbhmakerlab/openinnovation/session"
)

const (
	createUserSQL = `
	id serial PRIMARY KEY,
	email text NOT NULL,
	password text NOT NULL,
	fullname text NOT NULL,
	title text NOT NULL,
	description text NOT NULL,
	avatar_url text NOT NULL,
	verification_code text NOT NULL,
	is_admin boolean NOT NULL,
	updated_at timestamp NOT NULL,
	created_at timestamp NOT NULL`
)

const (
	UserAvatarURL = `Content/user/%d/image`
)

type User interface {
	ID() int64
	IDStr() string
	Exists() bool
	UpdateFullname(fullname string) error
	UpdateTitle(title string) error
	UpdateDescription(description string) error
	UpdateInterests(interests []string) error
	UpdateAvatarURL(url string) error

	SetStatus(status string)

	IsMember(projectID int64) bool
	IsAuthor(projectID int64) bool
	IsAdmin() bool
}

type user struct {
	ID_              int64     `json:"id"`
	IDStr_           string    `json:"idStr"`
	Email            string    `json:"email"`
	Password         string    `json:"-"`
	Fullname         string    `json:"fullname"`
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	AvatarURL        string    `json:"avatarURL"`
	VerificationCode string    `json:"-"`
	IsAdmin_         bool      `json:"isAdmin"`
	UpdatedAt        time.Time `json:"updatedAt"`
	CreatedAt        time.Time `json:"createdAt"`

	IsFriend         bool      `json:"isFriend,omitempty"`
	Interests_       []string  `json:"interests"`
	Status           string    `json:"status,omitempty"`
}

func (u user) ID() int64 {
	return u.ID_
}

func (u user) IDStr() string {
	return u.IDStr_
}

func (u user) IsAdmin() bool {
	return u.IsAdmin_
}

func (u user) Exists() bool {
	return u.Email != ""
}

func (u user) SetStatus(status string) {
	u.Status = status
}

func GetUser(userID int64) (User, error) {
	const rawSQL = `
	SELECT * FROM user_ WHERE id = $1 LIMIT 1`

	return queryUser(rawSQL, userID)
}

type GetUserParams struct {
	CurrentUserID int64
}

func GetUserWithParams(userID int64, params GetUserParams) (User, error) {
	const rawSQL = `
	SELECT * FROM user_ WHERE id = $1 LIMIT 1`

	var u user
	var err error

	if u, err = queryUser(rawSQL, userID); err != nil {
		return nil, err
	}

	if params.CurrentUserID > 0 {
		var err error
		if u.IsFriend, err = IsFriend(params.CurrentUserID, u.ID_); err != nil {
			return nil, err
		}
	}

	return u, nil
}

func GetAllUsers() ([]User, error) {
	const rawSQL = `
	SELECT * FROM user_`

	return queryUsers(rawSQL)
}

func queryUser(q string, data ...interface{}) (user, error) {
	var u user
	var err error

	if err = db.QueryRow(q, data...).Scan(
		&u.ID_,
		&u.Email,
		&u.Password,
		&u.Fullname,
		&u.Title,
		&u.Description,
		&u.AvatarURL,
		&u.VerificationCode,
		&u.IsAdmin_,
		&u.UpdatedAt,
		&u.CreatedAt,
	); err != nil && err != sql.ErrNoRows {
		return u, err
	}

	u.IDStr_ = strconv.FormatInt(u.ID_, 10)
	if u.Interests_, err = UserTags(u.ID_); err != nil {
		return u, err
	}

	if len(u.AvatarURL) == 0 {
		u.AvatarURL = "avatar.jpg"
	}

	return u, nil
}

func queryUsers(q string, data ...interface{}) ([]User, error) {
	rows, err := db.Query(q, data...)
	if err != nil {
		return nil, err
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
			&u.IsAdmin_,
			&u.UpdatedAt,
			&u.CreatedAt,
		); err != nil {
			return nil, err
		}

		u.IDStr_ = strconv.FormatInt(u.ID_, 10)
		if u.Interests_, err = UserTags(u.ID_); err != nil {
			return nil, err
		}

		if len(u.AvatarURL) == 0 {
			u.AvatarURL = "avatar.jpg"
		}

		us = append(us, u)
	}

	return us, nil
}

func (u user) UpdateFullname(fullname string) error {
	const rawSQL = `
	UPDATE user_ SET fullname = $1, updated_at = now() WHERE id = $2`

	if _, err := db.Exec(rawSQL, fullname, u.ID_); err != nil {
		return err
	}

	return nil
}

func (u user) UpdateTitle(title string) error {
	const rawSQL = `
	UPDATE user_ SET title = $1, updated_at = now() WHERE id = $2`

	if _, err := db.Exec(rawSQL, title, u.ID_); err != nil {
		return err
	}

	return nil
}

func (u user) UpdateDescription(description string) error {
	const rawSQL = `
	UPDATE user_ SET description = $1, updated_at = now() WHERE id = $2`

	if _, err := db.Exec(rawSQL, description, u.ID_); err != nil {
		return err
	}

	return nil
}

func (u user) UpdateInterests(interests []string) error {
	if err := UpdateUserTags(u.ID_, interests); err != nil {
		return err
	}
	return nil
}

func (u user) UpdateAvatarURL(url string) error {
	const q = `UPDATE user_ SET avatar_url = $1, updated_at = now() WHERE id = $2`

	if _, err := db.Exec(q, url, u.ID_); err != nil {
		return err
	}
	return nil
}

func CreatedProjects(userID int64) ([]Project, error) {
	const rawSQL = `SELECT * FROM project WHERE authorID = $1`

	return queryProjects(rawSQL, userID)
}

func InvolvedProjects(userID int64) ([]Project, error) {
	const rawSQL = `
	SELECT project.* FROM project
	INNER JOIN member ON member.project_id = project.id
	WHERE member.user_id = $1`

	return queryProjects(rawSQL, userID)
}

func CompletedProjects(userID int64) ([]Project, error) {
	const rawSQL = `
	SELECT project.* FROM project
	WHERE author_id = $1 AND status = $2`

	return queryProjects(rawSQL, userID, "completed")
}

func (u user) CreatedProjectsCount() (int64, error) {
	const q = `SELECT COUNT(*) FROM project WHERE authorID = $1`

	return count(q, u.ID_)
}

func (u user) InvolvedProjectsCount() (int64, error) {
	const q = `
	SELECT COUNT(project.*) FROM project
	INNER JOIN member ON member.projectID = project.id
	WHERE member.user_id = $1`

	return count(q, u.ID_)
}

func (u user) CompletedProjectsCount() (int64, error) {
	const q = `
	SELECT COUNT(project.*) FROM project
	WHERE status = 'completed' AND project.authorID = $1`

	return count(q, u.ID_)
}

func MaxCreatedProjectsCount() (int64, error) {
	const q = `
	SELECT MAX(n) FROM (
		SELECT COUNT(*) AS n FROM project
		GROUP BY project.authorID
	) as n`

	return count(q)
}

func MaxInvolvedProjectsCount() (int64, error) {
	const q = `
	SELECT MAX(n) FROM (
		SELECT COUNT(project.*) AS n FROM project
		INNER JOIN member ON member.projectID = project.id
		GROUP BY member.user_id
	) as n`

	return count(q)
}

func MaxCompletedProjectsCount() (int64, error) {
	const q = `
	SELECT MAX(n) FROM (
		SELECT COUNT(project.*) AS n FROM project
		WHERE status = 'completed
		GROUP BY project.authorID'
	) as n`

	return count(q)
}

func (u user) IsMember(projectID int64) bool {
	return IsMember(projectID, u.ID_)
}

func (u user) IsAuthor(projectID int64) bool {
	return isAuthor(projectID, u.ID_)
}

func SetAdmin(w http.ResponseWriter, r *http.Request) {
	var parser Parser

	const rawSQL = `
	UPDATE user_ WHERE id = $1 WHERE is_admin = false
	SET is_admin = true`

	userID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if _, err := db.Exec(rawSQL, userID); err != nil {
		response.ServerError(w, err)
	}
}

func UnsetAdmin(w http.ResponseWriter, r *http.Request) {
	var parser Parser

	const rawSQL = `
	UPDATE user_ WHERE id = $1 WHERE is_admin = true
	SET is_admin = false`

	id := parser.Int(r.FormValue("id"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if _, err := db.Exec(rawSQL, id); err != nil {
		response.ServerError(w, err)
	}
}

func GetAdmins(w http.ResponseWriter, r *http.Request) {
	var parser Parser

	count := parser.Int(r.FormValue("count"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	const rawSQL = `
	SELECT * FROM user_ WHERE is_admin = true
	LIMIT $1`

	users, err := queryUsers(rawSQL, count)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, users)
}

func GetUserByEmail(email string) (User, error) {
	const rawSQL = `
	SELECT * FROM user_ WHERE email = $1`

	return queryUser(rawSQL, email)
}

func CurrentUser(r *http.Request) User {
	user, err := GetUserByEmail(session.GetEmail(r))
	if err != nil {
		debug.Warn(err)
		return nil
	}

	if user.ID() == 0 {
		return nil
	}

	return user
}

func GetRelatedUserIDs(userID int64) ([]int64, error) {
	const rawSQL = `
	SELECT user_.id FROM user_
	INNER JOIN friend ON user_.id = friend.user1_id
	INNER JOIN member ON user_.id = member.user_id
	INNER JOIN project ON project.id = member.project_id
	WHERE user_.id != $1 AND project.id = (SELECT project_id FROM member WHERE user_id = $1)
	GROUP BY user_.id`

	rows, err := db.Query(rawSQL, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ids []int64
	for rows.Next() {
		var id int64
		if err = rows.Scan(&id); err != nil && err != sql.ErrNoRows {
			return ids, err
		}

		ids = append(ids, id)
	}

	return ids, nil
}
