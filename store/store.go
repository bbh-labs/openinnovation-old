package store

import (
	"database/sql"
	"fmt"
	"log"

	"bbhoi.com/debug"
	_ "github.com/lib/pq"
)

const (
	ContentFolder = "public"
)

var db *sql.DB

func init() {
	var err error

	db, err = sql.Open("postgres", "user=bbh dbname=oi sslmode=disable password=Lion@123")
	if err != nil {
		log.Fatal(err)
	}

	create := func(name, content string) error {
		if err != nil {
			return err
		}
		err = createTable(name, content)
		return err
	}

	// primary tables
	create("user_", createUserSQL)
	create("project", createProjectSQL)
	create("task", createTaskSQL)
	create("member", createMemberSQL)
	create("worker", createWorkerSQL)

	// secondary tables
	create("featured_project", createFeaturedProjectSQL)
}

func createTable(name, content string) error {
	if exists, err := tableExists(name); err != nil {
		return debug.Error(err)
	} else if exists {
		return nil
	}

	if _, err := db.Exec("CREATE TABLE " + name + "(" + content + ")"); err != nil {
		debug.Warn(err)
		return debug.Error(err)
	}

	fmt.Println("created table:", name)
	return nil
}

func tableExists(name string) (bool, error) {
	var q = `SELECT * from information_schema.tables WHERE table_schema = 'public' AND table_name = '` + name + `'`

	rows, err := db.Query(q)
	if err != nil && err != sql.ErrNoRows {
		return false, debug.Error(err)
	}
	defer rows.Close()

	return rows.Next(), nil
}

func Exists(rawSQL string, data ...interface{}) (bool, error) {
	var count int64
	if err := db.QueryRow(rawSQL, data...).Scan(&count); err != nil {
		return false, err
	}
	return count > 0, nil
}

func count(rawSQL string, data ...interface{}) (int64, error) {
	var count int64
	if err := db.QueryRow(rawSQL, data...).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}
