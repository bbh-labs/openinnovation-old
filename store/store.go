package store

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
	//"time"

	"github.com/bbhasiapacific/openinnovation/debug"
	"github.com/lib/pq"
)

var db *sql.DB
var listener *pq.Listener
var Notify func(channel, extra string)

var dataSource = flag.String("datasource", "user=bbh dbname=oi sslmode=disable password=Lion@123", "SQL data source")

func Init() {
	var err error

	db, err = sql.Open("postgres", *dataSource)
	if err != nil {
		debug.Warn(err)
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
	create("milestone", createMilestoneSQL)
	create("member", createMemberSQL)
	create("worker", createWorkerSQL)
	create("friend", createFriendSQL)
	create("chat", createChatSQL)

	// secondary tables
	create("featured_project", createFeaturedProjectSQL)
	create("user_tag", createUserTagSQL)
	create("task_tag", createTaskTagSQL)
	create("tag", createTagSQL)

	// setup listener
	/*
	listener = pq.NewListener(*dataSource, 1 * time.Second, time.Minute, func(ev pq.ListenerEventType, err error) {
		if err != nil {
			debug.Warn(err)
		}
	})

	if err := listener.Listen("chat"); err != nil {
		debug.Warn(err)
		log.Fatal(err)
	}

	go func() {
		for {
			select {
			case notification := <-listener.Notify:
				if Notify != nil {
					Notify(notification.Channel, notification.Extra)
				}
			}
		}
	}()
	*/
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
