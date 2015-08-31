package store

import (
	"github.com/bbhmakerlab/openinnovation/debug"
)

const createUserTagSQL = `
user_id bigint NOT NULL,
tag_id bigint NOT NULL`

func UpdateUserTags(userID int64, tags []string) error {
	const rawSQL = `
	INSERT INTO user_tag VALUES ($1, (SELECT id FROM tag WHERE name = $2))`

	if err := ClearUserTags(userID); err != nil {
		debug.Error(err)
		return err
	}

	for _, tag := range tags {
		if yes, err := TagExists(tag); err != nil {
			debug.Error(err)
			return err
		} else if !yes {
			if err := CreateTag(tag); err != nil {
				debug.Error(err)
				return err
			}
		}
		if _, err := db.Exec(rawSQL, userID, tag); err != nil {
			debug.Error(err)
			return err
		}
	}

	return nil
}

func ClearUserTags(userID int64) error {
	const rawSQL = `
	DELETE FROM user_tag WHERE user_id = $1`

	if _, err := db.Exec(rawSQL, userID); err != nil {
		debug.Error(err)
		return err
	}

	return nil
}

func UserTags(userID int64) ([]string, error) {
	const rawSQL = `
	SELECT tag.name FROM tag
	INNER JOIN user_tag ON tag.id = user_tag.tag_id
	WHERE user_tag.user_id = $1`

	return queryTags(rawSQL, userID)
}
