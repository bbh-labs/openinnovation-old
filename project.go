package main

import (
	"net/http"

	"bbhoi.com/debug"
	"bbhoi.com/response"
	"bbhoi.com/store"
	"github.com/gorilla/context"
)

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

	if p.Author, err = store.GetUserByID(p.AuthorID); err != nil {
		response.ServerError(w, err)
		return
	}

	user := context.Get(r, "user").(store.User)
	p.IsMember = store.IsMember(projectID, user.ID())

	response.OK(w, p)
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

	var err error
	for k, v := range r.Form {
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

	response.OK(w, nil)
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
