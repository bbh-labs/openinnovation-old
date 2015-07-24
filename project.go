package main

import (
	"net/http"
	"strconv"

	"bbhoi.com/response"
	"bbhoi.com/store"
)

func projectByID(w http.ResponseWriter, r *http.Request) {
	projectID, err := strconv.ParseInt(r.FormValue("projectID"), 10, 0)
	if err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	project, err := store.GetCompleteProject(projectID)
	if err != nil {
		response.ServerError(w, err)
		return
	}
	response.OK(w, project)
}

func featuredProjects(w http.ResponseWriter, r *http.Request) {
	ps, err := store.FeaturedProjects(r)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, ps)
}
