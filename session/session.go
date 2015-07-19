package session

import (
	"math/rand"
	"net/http"

	"bbhoi.com/store"
	"github.com/gorilla/sessions"
)

var cookieStore = sessions.NewCookieStore([]byte("bbh.oi"))

func Set(w http.ResponseWriter, r *http.Request, email string) error {
	session := Get(r)
	session.Values["email"] = email
	session.Values["session_id"] = rand.Int()
	session.Save(r, w)
	return nil
}

func Clear(w http.ResponseWriter, r *http.Request) {
	session := Get(r)
	session.Values["email"] = ""
	session.Values["session_id"] = 0
	session.Save(r, w)
}

func Get(r *http.Request) *sessions.Session {
	session, _ := cookieStore.Get(r, "session")
	return session
}

func GetEmail(r *http.Request) string {
	session := Get(r)
	data := session.Values["email"]
	if data != nil {
		return data.(string)
	}
	return ""
}

func GetUser(r *http.Request) store.User {
	email := GetEmail(r)
	return store.GetUser(email)
}
