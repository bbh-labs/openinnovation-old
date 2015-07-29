package main

import (
	"net/http"

	"github.com/codegangsta/negroni"
	"github.com/gorilla/mux"

	_ "bbhoi.com/store"
)

func home(w http.ResponseWriter, r *http.Request) {
	r.Header.Set("Content-Type", "text/html")
	http.ServeFile(w, r, "public/main.html")
}

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/", home)
	router.HandleFunc("/login", login)
	router.HandleFunc("/register", register)
	router.HandleFunc("/verify", verify)

	apiRouter := mux.NewRouter()
	apiRouter.HandleFunc("/api/logout", logout)
	apiRouter.HandleFunc("/api/user", user)
	apiRouter.HandleFunc("/api/project", project)
	apiRouter.HandleFunc("/api/task", task)
	router.PathPrefix("/api").Handler(negroni.New(
		negroni.HandlerFunc(apiMiddleware),
		negroni.Wrap(apiRouter),
	))

	adminRouter := mux.NewRouter()
	adminRouter.HandleFunc("/api/admin/user", adminUser)
	adminRouter.HandleFunc("/api/admin/project", adminProject)
	router.PathPrefix("/api/admin").Handler(negroni.New(
		negroni.HandlerFunc(adminMiddleware),
		negroni.Wrap(adminRouter),
	))

	n := negroni.Classic()
	n.UseHandler(router)
	n.Run(":8080")
}
