package store

import (
	"database/sql"
	"time"

	"bbhoi.com/debug"
)

const (
	createTaskSQL = `
	id serial PRIMARY KEY,
	authorID int NOT NULL,
	sourceID int NOT NULL,
	milestoneID int NOT NULL,
	title text NOT NULL,
	description text NOT NULL,
	category text NOT NULL,
	status text NOT NULL,
	startDate timestamp NOT NULL,
	endDate timestamp NOT NULL,
	createdAt timestamp NOT NULL`
)

type Task struct {
	ID          int64     `json:"id"`
	AuthorID    int64     `json:"authorID"`
	SourceID    int64     `json:"sourceID"`
	MilestoneID int64     `json:"milestoneID"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Status      string    `json:"status"`
	StartDate   time.Time `json:"startDate"`
	EndDate     time.Time `json:"endDate"`
	CreatedAt   time.Time `json:"createdAt"`

	Project Project `json:"project,omitempty"`
	Doers   []Doer  `json:"doers"`
}

func insertTask(authorID, sourceID, milestoneID int64, title, description, category, status, startDateStr, endDateStr string) (int64, error) {
	const q = `
	INSERT INTO task (authorID, sourceID, milestoneID, title, description, category, status, startDate, endDate, createdAt)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`

	var startDate, endDate time.Time
	var err error

	startDate, err = time.Parse("01/02/2006 3:04 PM", startDateStr)
	if err != nil {
		return 0, debug.Error(err)
	}

	endDate, err = time.Parse("01/02/2006 3:04 PM", endDateStr)
	if err != nil {
		return 0, debug.Error(err)
	}

	res, err := db.Exec(q, authorID, sourceID, milestoneID, title, description, category, status, startDate, endDate)
	if err != nil {
		return 0, debug.Error(err)
	}

	return res.LastInsertId()
}

func updateTask(taskID, milestoneID int64, title, description, category, status, startDateStr, endDateStr string) error {
	const q = `UPDATE task SET milestoneID = ?, title = ?, description = ?, category = ?, status = ?, startDate = ?, endDate = ? WHERE id = ?`

	var startDate, endDate time.Time
	var err error

	startDate, err = time.Parse("01/02/2006 3:04 PM", startDateStr)
	if err != nil {
		return debug.Error(err)
	}

	endDate, err = time.Parse("01/02/2006 3:04 PM", endDateStr)
	if err != nil {
		return debug.Error(err)
	}

	if _, err := db.Exec(q, milestoneID, title, description, category, status, startDate, endDate, taskID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func deleteTask(taskID int64) error {
	const q = `DELETE FROM task WHERE id = ?`

	if _, err := db.Exec(q, taskID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func deleteAllTasks(projectID int64) error {
	const q = `DELETE FROM task WHERE sourceID = ?`

	if _, err := db.Exec(q, projectID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func GetTask(taskID int64) Task {
	const q = `SELECT * FROM task WHERE id = ?`

	var t Task

	if err := db.QueryRow(q, taskID).Scan(
		&t.ID,
		&t.AuthorID,
		&t.SourceID,
		&t.MilestoneID,
		&t.Title,
		&t.Description,
		&t.Category,
		&t.Status,
		&t.StartDate,
		&t.EndDate,
		&t.CreatedAt,
	); err != nil {
		debug.Warn(err)
		return t
	}

	var err error
	if t.Doers, err = getDoers(t.ID); err != nil {
		debug.Warn(err)
	}

	return t
}

func GetTasks(sourceID int64) []Task {
	const q = `SELECT * FROM task WHERE sourceID = ?`

	return queryTasks(q, sourceID)
}

func GetLatestTasks(count int64) []Task {
	const q = `SELECT * FROM task ORDER BY createdAt DESC LIMIT ?`

	return queryTasksWithProject(q, count)
}

func queryTasks(q string, data ...interface{}) []Task {
	rows, err := db.Query(q, data...)
	if err != nil {
		debug.Warn(err)
		return nil
	}
	defer rows.Close()

	var ts []Task

	for rows.Next() {
		var t Task

		if err = rows.Scan(
			&t.ID,
			&t.AuthorID,
			&t.SourceID,
			&t.MilestoneID,
			&t.Title,
			&t.Description,
			&t.Category,
			&t.Status,
			&t.StartDate,
			&t.EndDate,
			&t.CreatedAt,
		); err != nil {
			debug.Warn(err)
			return nil
		}

		if t.Doers, err = getDoers(t.ID); err != nil {
			debug.Warn(err)
			return nil
		}

		ts = append(ts, t)
	}

	return ts
}

func queryTasksWithProject(q string, data ...interface{}) []Task {
	rows, err := db.Query(q, data...)
	if err != nil {
		debug.Warn(err)
		return nil
	}
	defer rows.Close()

	var ts []Task

	for rows.Next() {
		var t Task

		if err = rows.Scan(
			&t.ID,
			&t.AuthorID,
			&t.SourceID,
			&t.MilestoneID,
			&t.Title,
			&t.Description,
			&t.Category,
			&t.Status,
			&t.StartDate,
			&t.EndDate,
			&t.CreatedAt,
		); err != nil {
			debug.Warn(err)
			return nil
		}

		if t.Project, err = getProject(t.SourceID); err != nil {
			debug.Warn(err)
			return nil
		}

		if t.Doers, err = getDoers(t.ID); err != nil {
			debug.Warn(err)
			return nil
		}

		ts = append(ts, t)
	}

	return ts
}

func PopularTaskCategories() ([]int64, error) {
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
			   GROUP BY category`

	var ss [12]int64

	if err := db.QueryRow(q).Scan(
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

func GetTaskProjectID(taskID int64) int64 {
	const q = `
	SELECT sourceID FROM task
	WHERE id = ?`

	var projectID int64
	if err := db.QueryRow(q, taskID).Scan(&projectID); err != nil {
		debug.Warn(err)
		return 0
	}

	return projectID
}
