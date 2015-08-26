package store

import (
	"database/sql"

	"github.com/bbhasiapacific/openinnovation/debug"
)

const (
	createFriendSQL = `
	user1_id int NOT NULL,
	user2_id int NOT NULL`
)

func GetFriends(userID int64) ([]User, error) {
	const rawSQL = `
	SELECT user_.* FROM user_
	INNER JOIN friend ON user_.id = friend.user1_id
	WHERE user_.id != $1`

	return queryUsers(rawSQL, userID)
}

func AddFriend(userID, otherUserID int64) error {
	const rawSQL = `
	INSERT INTO friend
	VALUES ($1, $2), ($3, $4)`

	if _, err := db.Exec(rawSQL, userID, otherUserID, otherUserID, userID); err != nil {
		debug.Error(err)
		return err
	}

	return nil
}

func RemoveFriend(userID, otherUserID int64) error {
	const rawSQL = `
	DELETE FROM friend
	WHERE (user1_id = $1 AND user2_id = $2)
	OR (user2_id = $1 AND user1_id = $2)`

	if _, err := db.Exec(rawSQL, userID, otherUserID); err != nil {
		debug.Error(err)
		return err
	}

	return nil
}

func IsFriend(userID, otherUserID int64) (bool, error) {
	const rawSQL = `
	SELECT COUNT(*) FROM friend
	WHERE user1_id = $1 AND user2_id = $2`

	return Exists(rawSQL, userID, otherUserID)
}

func GetFriendIDs(userID int64) ([]int64, error) {
	const rawSQL = `
	SELECT user_.id FROM user_
	INNER JOIN friend ON user_.id = friend.user1_id
	WHERE user_.id != $1`

	rows, err := db.Query(rawSQL, userID)
	if err != nil {
		debug.Error(err)
		return nil, err
	}
	defer rows.Close()

	var ids []int64
	for rows.Next() {
		var id int64
		if err = rows.Scan(&id); err != nil && err != sql.ErrNoRows {
			debug.Error(err)
			return ids, err
		}

		ids = append(ids, id)
	}

	return ids, nil
}
