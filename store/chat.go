package store

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/bbhasiapacific/bbhoi.com/debug"
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
		return c, debug.Error(err)
	}

	return c, nil
}

func GetChats(channelID int64, channelType string) ([]Chat, error) {
	const rawSQL = `
	SELECT * FROM chat
	WHERE channel_id = $1 AND channel_type = $2
	ORDER BY created_at`

	return queryChats(rawSQL, channelID, channelType)
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
		return 0, debug.Error(err)
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
		return debug.Error(err)
	}

	return nil
}

func queryChats(rawSQL string, data ...interface{}) ([]Chat, error) {
	rows, err := db.Query(rawSQL, data...)
	if err != nil {
		return nil, debug.Error(err)
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
		); err != nil && err != sql.ErrNoRows {
			return nil, debug.Error(err)
		}

		cs = append(cs, c)
	}

	return cs, nil
}
