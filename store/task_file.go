package store

import (
	"github.com/bbhasiapacific/bbhoi.com/debug"
)

const createTaskFileSQL = `
task_id bigint NOT NULL,
file_id text NOT NULL`

func GetTaskFiles(taskID int64) ([]string, error) {
	const rawSQL = `
	SELECT file_id FROM task_file
	WHERE task_id = $1`

	rows, err := db.Query(rawSQL, taskID)
	if err != nil {
		return nil, debug.Error(err)
	}
	defer rows.Close()

	var ids []string
	
	for rows.Next() {
		var id string
		if err = rows.Scan(&id); err != nil {
			return ids, debug.Error(err)
		}
	
		ids = append(ids, id)
	}

	return ids, nil
}

func CreateTaskFile(taskID int64, fileID string) error {
	const rawSQL = `
	INSERT INTO task_file VALUES ($1, $2)`

	if _, err := db.Exec(rawSQL, taskID, fileID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func DeleteTaskFile(taskID int64, fileID string) error {
	const rawSQL = `
	DELETE FROM task_file
	WHERE task_id = $1 AND file_id = $2`

	if _, err := db.Exec(rawSQL, taskID, fileID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func DeleteTaskFiles(taskID int64) error {
	const rawSQL = `
	DELETE FROM task_file
	WHERE task_id = $1`

	if _, err := db.Exec(rawSQL, taskID); err != nil {
		return debug.Error(err)
	}

	return nil
}
