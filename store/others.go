package store

import (
	"net/http"
	"strconv"
	"time"
)

//////////////////////
// Featured Project //
//////////////////////

const (
	createFeaturedProjectSQL = `
	project_id int NOT NULL,
	created_at timestamp NOT NULL`
)

type FeaturedProject struct {
	ProjectID			int64		`json:"id,omitempty"`
	CreatedAt			time.Time	`json:"createdAt,omitempty"`
}

func FeaturedProjects(r *http.Request) ([]Project, error) {
	const q = `SELECT * FROM project LIMIT ?`

	count, err := strconv.ParseInt(r.FormValue("count"), 10, 0)
	if err != nil {
		count = 3
	}

	return queryProjects(q, count)
}

