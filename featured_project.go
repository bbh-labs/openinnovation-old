package main

import (
	"net/http"

	"github.com/bbhmakerlab/openinnovation/response"
	"github.com/bbhmakerlab/openinnovation/store"
)

func FeaturedProjects(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	count := parser.Int(r.FormValue("count"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	projects, err := store.FeaturedProjects(count)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, projects)
}
