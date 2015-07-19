package store

import (
	"log"

	"bbhoi.com/debug"
)

const (
	createMemberSQL = `
	projectID int NOT NULL,
	userID int NOT NULL,
	status text NOT NULL`

	insertMemberSQL = `
	INSERT INTO member (projectID, userID, status)
	VALUES (?, ?, ?)`

	authorProjectSQL = `
	INSERT INTO member (projectID, userID, status)
	VALUES (?, ?, "accepted")`

	updateMemberStatusSQL = `
	UPDATE member SET status = ?
	WHERE projectID = ? AND userID = ?`

	getMembersSQL = `SELECT * FROM member WHERE projectID = ? AND status = ?`

	getMembersOfProjectsBySQL = `
	SELECT member.* FROM member
	INNER JOIN project ON project.authorID = ? AND member.projectID = project.id
	WHERE status = ?`

	deleteMemberSQL = `
	SELECT * FROM member WHERE projectID = ? AND userID ?`

	isMemberSQL = `
	SELECT COUNT(*) FROM member WHERE projectID = ? AND userID = ?`

	hasMemberSQL = `
	SELECT COUNT(*) FROM member
	WHERE projectID = ? AND userID = ? AND status = ?`
)

type Member struct {
	User User

	ProjectID int64  `json:"projectID"`
	UserID    int64  `json:"userID"`
	Status    string `json:"status"`
}

func createMemberTable() {
	if err := createTable(
		"member",
		`projectID INTEGER NOT NULL,
		 userID INTEGER NOT NULL,
		 status TEXT NOT NULL`,
	); err != nil {
		log.Fatal(err)
	}
}

func insertMember(projectID, userID int64) error {
	if _, err := db.Exec(insertMemberSQL, projectID, userID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func GetMembers(projectID int64, status string) []User {
	return queryMembers(getMembersSQL, projectID, status)
}

func getMembersOfProjectsBy(authorID int64, status string) []User {
	return queryMembers(getMembersOfProjectsBySQL, authorID, status)
}

func deleteMember(projectID, userID int64) error {
	if _, err := db.Exec(deleteMemberSQL, projectID, userID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func deleteAllMembers(projectID int64) error {
	const q = `
	DELETE FROM member WHERE projectID = ?`

	if _, err := db.Exec(q, projectID); err != nil {
		return debug.Error(err)
	}
	return nil
}

func isMember(projectID, userID int64) bool {
	return exists(isMemberSQL, projectID, userID)
}

func queryMembers(q string, data ...interface{}) []User {
	rows, err := db.Query(q, data...)
	if err != nil {
		debug.Warn(err)
		return nil
	}
	defer rows.Close()

	var us []User
	for rows.Next() {
		var m Member

		if err = rows.Scan(
			&m.ProjectID,
			&m.UserID,
			&m.Status,
		); err != nil {
			debug.Warn(err)
			return nil
		}

		u := GetUser(m.UserID)
		us = append(us, u)
	}

	return us
}

func authorProject(projectID, userID int64) {
	if _, err := db.Exec(authorProjectSQL, projectID, userID); err != nil {
		debug.Warn(err)
	}
}

func appliedProject(projectID, userID int64) bool {
	return exists(hasMemberSQL, projectID, userID, "pending")
}

func joinedProject(projectID, userID int64) bool {
	return exists(hasMemberSQL, projectID, userID, "accepted")
}
