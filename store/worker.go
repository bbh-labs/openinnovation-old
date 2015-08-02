package store

import (
	"bbhoi.com/debug"
)

const createWorkerSQL = `
task_id int NOT NULL,
user_id int NOT NULL,
assigner_id int NOT NULL,
created_at timestamp NOT NULL`

func GetWorkers(taskID int64) ([]User, error) {
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

func InsertWorker(taskID, userID, assignerID int64) error {
	const rawSQL = `
	INSERT INTO worker (task_id, user_id, assigner_id, created_at)
	VALUES ($1, $2, $3, now())`

	const existSQL = `
	SELECT COUNT(*) FROM worker WHERE task_id = $1 AND user_id = $2`

	if _, err := db.Exec(rawSQL, taskID, userID, assignerID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func DeleteWorker(taskID, userID int64) error {
	const rawSQL = `
	DELETE FROM worker WHERE task_id = $1 AND user_id = $2`

	if _, err := db.Exec(rawSQL, taskID, userID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func ToggleWorker(taskID, userID, assignerID int64) error {
	var is bool
	var err error

	if is, err = isWorker(taskID, userID); err != nil {
		return debug.Error(err)
	}

	if is {
		if err = DeleteWorker(taskID, userID); err != nil {
			return debug.Error(err)
		}
	} else {
		if err = InsertWorker(taskID, userID, assignerID); err != nil {
			return debug.Error(err)
		}
	}

	return nil
}

func isWorker(taskID, userID int64) (bool, error) {
	const rawSQL = `
	SELECT COUNT(*) FROM worker
	WHERE task_id = $1 AND user_id = $2`

	return Exists(rawSQL, taskID, userID)
}
