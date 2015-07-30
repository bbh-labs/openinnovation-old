package store

import (
	"net/http"

	"bbhoi.com/debug"
	"bbhoi.com/response"
)

const createWorkerSQL = `
task_id int NOT NULL,
user_id int NOT NULL,
assigner_id int NOT NULL,
created_at timestamp NOT NULL`

func GetWorkers(w http.ResponseWriter, r *http.Request) {
	var parser Parser

	taskID := parser.Int(r.FormValue("taskID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	workers, err := getWorkers(taskID)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, workers)
}

func getWorkers(taskID int64) ([]User, error) {
	const rawSQL = `
	SELECT user_.* FROM worker
	INNER JOIN user_ ON user_.id = worker.user_id
	WHERE worker.task_id = $1`

	workers, err := queryUsers(rawSQL, taskID)
	if err != nil {
		return nil, debug.Error(err)
	}

	return workers, nil
}

func insertWorker(taskID, userID, assignerID int64) error {
	const rawSQL = `
	INSERT INTO worker (task_id, user_id, assigner_id, created_at)
	VALUES ($1, $2, $3, now())`

	if _, err := db.Exec(rawSQL, taskID, userID, assignerID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func deleteWorker(taskID, userID int64) error {
	const rawSQL = `
	DELETE FROM worker WHERE task_id = $1 AND user_id = $1`

	if _, err := db.Exec(rawSQL, taskID, userID); err != nil {
		return debug.Error(err)
	}

	return nil
}
