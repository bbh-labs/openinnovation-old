package store

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/bbhasiapacific/openinnovation/debug"
)

const createChatSQL = `
id serial NOT NULL,
user_id int NOT NULL,
channel_id int NOT NULL,
channel_type text NOT NULL,
text text NOT NULL,
created_at timestamp NOT NULL`

type Chat struct {
	ID_          int64     `json:"id"`
	UserID_      int64     `json:"userID"`
	ChannelID_   int64     `json:"channelID"`
	ChannelType_ string    `json:"channelType"`
	Text_        string    `json:"text"`
	CreatedAt_   time.Time `json:"createdAt"`

	Username_    string    `json:"username"`
}

func GetChat(id int64) (Chat, error) {
	const rawSQL = `
	SELECT * FROM chat
	WHERE id = $1`

	var c Chat
	if err := db.QueryRow(rawSQL, id).Scan(
		&c.ID_,
		&c.UserID_,
		&c.ChannelID_,
		&c.ChannelType_,
		&c.Text_,
		&c.CreatedAt_,
	); err != nil {
		debug.Error(err)
		return c, err
	}

	return c, nil
}

func GetChats(userID, channelID int64, channelType string, startID, count int64) ([]Chat, error) {
	if channelType == "user" {
		if count == -1 {
			const rawSQL = `
			SELECT chat.*, user_.fullname FROM chat
			INNER JOIN user_ ON user_.id = user_id
			WHERE ((user_id = $1 AND channel_id = $2) OR (user_id = $2 AND channel_id = $1)) AND channel_type = $3 AND chat.id > $4
			ORDER BY created_at`

			return queryChats(rawSQL, userID, channelID, channelType, startID)
		} else {
			const rawSQL = `
			SELECT chat.*, user_.fullname FROM chat
			INNER JOIN user_ ON user_.id = user_id
			WHERE ((user_id = $1 AND channel_id = $2) OR (user_id = $2 AND channel_id = $1)) AND channel_type = $3 AND chat.id > $4
			ORDER BY created_at
			LIMIT $5`

			return queryChats(rawSQL, userID, channelID, channelType, startID, count)
		}
	} else {
		if count == -1 {
			const rawSQL = `
			SELECT chat.*, user_.fullname FROM chat
			INNER JOIN user_ ON user_.id = user_id
			WHERE channel_id = $1 AND channel_type = $2 AND chat.id > $3
			ORDER BY created_at`

			return queryChats(rawSQL, channelID, channelType, startID)
		} else {
			const rawSQL = `
			SELECT chat.*, user_.fullname FROM chat
			INNER JOIN user_ ON user_.id = user_id
			WHERE channel_id = $1 AND channel_type = $2 AND chat.id > $3
			ORDER BY created_at
			LIMIT $4`

			return queryChats(rawSQL, channelID, channelType, startID, count)
		}
	}
}

type PostChatParams struct {
	UserID int64       `json:"userID"`
	ChannelID int64    `json:"channelID"`
	ChannelType string `json:"channelType"`
	Text string        `json:"text"`
}

func PostChat(params PostChatParams) (int64, error) {
	const rawSQL = `
	INSERT INTO chat (user_id, channel_id, channel_type, text, created_at)
	VALUES ($1, $2, $3, $4, now())
	RETURNING id`

	var id int64
	if err := db.QueryRow(
			rawSQL,
			params.UserID,
			params.ChannelID,
			params.ChannelType,
			params.Text,
	).Scan(&id); err != nil {
		debug.Error(err)
		return 0, err
	}

	return id, nil
}

type NotifyChatParams struct {
	ID int64 `json:"id"`
	PostChatParams
}

func NotifyChat(params NotifyChatParams) error {
	extra := fmt.Sprintf("c/%d/%d/%d/%s", params.ID, params.UserID, params.ChannelID, params.ChannelType)

	if _, err := db.Exec(`NOTIFY chat, '` + extra + `'`); err != nil {
		debug.Error(err)
		return err
	}

	return nil
}

func queryChats(rawSQL string, data ...interface{}) ([]Chat, error) {
	rows, err := db.Query(rawSQL, data...)
	if err != nil {
		debug.Error(err)
		return nil, err
	}
	defer rows.Close()

	var cs []Chat
	for rows.Next() {
		var c Chat

		if err = rows.Scan(
			&c.ID_,
			&c.UserID_,
			&c.ChannelID_,
			&c.ChannelType_,
			&c.Text_,
			&c.CreatedAt_,
			&c.Username_,
		); err != nil && err != sql.ErrNoRows {
			debug.Error(err)
			return nil, err
		}

		cs = append(cs, c)
	}

	return cs, nil
}
