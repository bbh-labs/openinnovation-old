package store

import (
	"github.com/bbhasiapacific/bbhoi.com/debug"
)

const createTaskTagSQL = `
task_id bigint NOT NULL,
tag_id bigint NOT NULL`

func UpdateTaskTags(taskID int64, tags []string) error {
	const rawSQL = `
	INSERT INTO task_tag VALUES ($1, (SELECT id FROM tag WHERE name = $2))`

	if err := ClearTaskTags(taskID); err != nil {
		return debug.Error(err)
	}

	for _, tag := range tags {
		if yes, err := TagExists(tag); err != nil {
			return debug.Error(err)
		} else if !yes {
			if err := CreateTag(tag); err != nil {
				return debug.Error(err)
			}
		}
		if _, err := db.Exec(rawSQL, taskID, tag); err != nil {
			return debug.Error(err)
		}
	}

	return nil
}

func ClearTaskTags(taskID int64) error {
	const rawSQL = `
	DELETE FROM task_tag WHERE task_id = $1`

	if _, err := db.Exec(rawSQL, taskID); err != nil {
		return debug.Error(err)
	}

	return nil
}

func TaskTags(taskID int64) ([]string, error) {
	const rawSQL = `
	SELECT tag.name FROM tag
	INNER JOIN task_tag ON tag.id = task_tag.tag_id
	WHERE task_tag.task_id = $1`

	return queryTags(rawSQL, taskID)
}
