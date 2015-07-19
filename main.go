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
	apiRouter := mux.NewRouter()
	apiRouter.HandleFunc("/api/login", login)
	apiRouter.HandleFunc("/api/logout", logout)
	apiRouter.HandleFunc("/api/register", register)
	apiRouter.HandleFunc("/api/verify", verify)

	router := mux.NewRouter()
	router.HandleFunc("/", home)
	router.PathPrefix("/api").Handler(negroni.New(
		negroni.Wrap(apiRouter),
	))

	n := negroni.Classic()
	n.UseHandler(router)
	n.Run(":8080")
}
