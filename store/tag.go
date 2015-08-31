package store

import (
	"github.com/bbhmakerlab/openinnovation/debug"
)

const createTagSQL = `
id bigserial PRIMARY KEY,
name text NOT NULL`

func CreateTag(name string) error {
	const rawSQL = `
	INSERT INTO tag (name) VALUES ($1)`

	if _, err := db.Exec(rawSQL, name); err != nil {
		debug.Error(err)
		return err
	}

	return nil
}

func RemoveTag(name string) error {
	const rawSQL = `
	DELETE FROM tag WHERE name = $1`

	if _, err := db.Exec(rawSQL, name); err != nil {
		debug.Error(err)
		return err
	}

	return nil
}

func TagExists(name string) (bool, error) {
	const rawSQL = `
	SELECT COUNT(*) FROM tag
	WHERE name = $1`

	return Exists(rawSQL, name)
}

func queryTags(q string, data ...interface{}) ([]string, error) {
	rows, err := db.Query(q, data...)
	if err != nil {
		debug.Error(err)
		return nil, err
	}
	defer rows.Close()

	var ts []string
	for rows.Next() {
		var t string
		if err = rows.Scan(&t); err != nil {
			debug.Error(err)
			return ts, err
		}
		ts = append(ts, t)
	}
	return ts, nil
}
