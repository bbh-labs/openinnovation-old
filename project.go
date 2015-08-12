package main

import (
	"net/http"

	"github.com/bbhasiapacific/bbhoi.com/debug"
	"github.com/bbhasiapacific/bbhoi.com/response"
	"github.com/bbhasiapacific/bbhoi.com/store"
	"github.com/gorilla/context"
)

func CreateProject(w http.ResponseWriter, r *http.Request) {
	title := r.FormValue("title")
	if title == "" {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	tagline := r.FormValue("tagline")
	description := r.FormValue("description")

	// basic project info
	projectID, err := store.CreateProject(map[string]string{
		"authorID":    user.IDStr(),
		"title":       title,
		"tagline":     tagline,
		"description": description,
	})
	if err != nil {
		response.ServerError(w, err)
		return
	}

	var ok bool

	// add author to project user list
	if err = store.AddMember(projectID, user.ID()); err != nil {
		goto error
	}

	// image
	if ok, err = store.SaveProjectImage(w, r, projectID); err != nil || !ok {
		goto error
	}

	response.OK(w, projectID)
	return

error:
	if err := store.DeleteProject(projectID); err != nil {
		debug.Warn(err)
	}
	response.ServerError(w, err)
}

func UpdateProject(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	if !user.IsAuthor(projectID) {
		response.ClientError(w, http.StatusForbidden)
		return
	}

	for k, v := range r.Form {
		var err error

		if len(v) == 0 {
			continue
		}

		switch k {
		case "title":
			err = store.UpdateProjectTitle(projectID, v[0])
		case "tagline":
			err = store.UpdateProjectTagline(projectID, v[0])
		case "description":
			err = store.UpdateProjectDescription(projectID, v[0])
		}
		if err != nil {
			response.ServerError(w, err)
			return
		}
	}

	if ok, err := store.SaveProjectImage(w, r, projectID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}

func DeleteProject(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	user := context.Get(r, "user").(store.User)
	if !user.IsAuthor(projectID) {
		response.ClientError(w, http.StatusUnauthorized)
		return
	}

	if err := store.DeleteProject(projectID); err != nil {
		response.ServerError(w, err)
		return
	}
}

func LatestProjects(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	count := parser.Int(r.FormValue("count"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	title := r.FormValue("title")

	projects, err := store.LatestProjects(title, count)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, projects)
}

func GetProject(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	p, err := store.GetProject(projectID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	if p.Author, err = store.GetUser(p.AuthorID); err != nil {
		response.ServerError(w, err)
		return
	}

	user := context.Get(r, "user").(store.User)
	p.IsMember = store.IsMember(projectID, user.ID())

	response.OK(w, p)
}

func SetFeaturedProject(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	const existSQL = `
	SELECT COUNT(*) FROM featured_project
	WHERE project_id = $1`

	projectID := parser.Int(r.FormValue("projectID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if exists, err := store.Exists(existSQL, projectID); err != nil {
		response.ServerError(w, debug.Error(err))
		return
	} else if exists {
		response.OK(w, nil)
		return
	}

	if err := store.SetFeaturedProject(projectID); err != nil {
		response.ServerError(w, debug.Error(err))
	}

	response.OK(w, nil)
}

func UnsetFeaturedProject(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	projectID := parser.Int(r.FormValue("projectID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	if err := store.UnsetFeaturedProject(projectID); err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, nil)
}

func CreatedProjects(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	userID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	ps, err := store.CreatedProjects(userID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, ps)
}

func InvolvedProjects(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	userID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	ps, err := store.InvolvedProjects(userID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, ps)
}

func CompletedProjects(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	userID := parser.Int(r.FormValue("userID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	ps, err := store.CompletedProjects(userID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, ps)
}
