package store

import (
	"github.com/bbhasiapacific/openinnovation/debug"
)

const (
	createMemberSQL = `
	project_id int NOT NULL,
	user_id int NOT NULL`
)

func GetMembers(projectID int64) ([]User, error) {
	const rawSQL = `
	SELECT user_.* FROM user_
	INNER JOIN member ON member.user_id = user_.id
	WHERE project_id = $1`

	return queryUsers(rawSQL, projectID)
}

func AddMember(projectID, userID int64) error {
	const rawSQL = `
	INSERT INTO member (project_id, user_id) VALUES ($1, $2)`

	if _, err := db.Exec(rawSQL, projectID, userID); err != nil {
		debug.Error(err)
		return err
	}

	return nil
}

func MemberExists(projectID, userID int64) (bool, error) {
	const rawSQL = `
	SELECT COUNT(*) FROM member
	WHERE project_id = $1 AND user_id = $2`

	return Exists(rawSQL, projectID, userID)
}

func RemoveMember(projectID, userID int64) error {
	const rawSQL = `
	DELETE FROM member WHERE project_id = $1 AND user_id = $2`

	if _, err := db.Exec(rawSQL, projectID, userID); err != nil {
		debug.Error(err)
		return err
	}

	return nil
}

func GetMemberIDs(projectID int64) ([]int64, error) {
	const rawSQL = `
	SELECT member.user_id FROM member WHERE project_id = $1`

	var ids []int64

	rows, err := db.Query(rawSQL, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var id int64
		if err = rows.Scan(&id); err != nil {
			debug.Error(err)
			return ids, err
		}

		ids = append(ids, id)
	}

	return ids, nil
}
