package store

import (
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
	ProjectID int64     `json:"id,omitempty"`
	CreatedAt time.Time `json:"createdAt,omitempty"`
}

func FeaturedProjects(count int64) ([]Project, error) {
	const rawSQL = `SELECT project.* FROM featured_project
	                INNER JOIN project ON project.id = featured_project.project_id
					LIMIT $1`

	return queryProjects(rawSQL, count)
}
