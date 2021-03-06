package main

import (
	"flag"
	"net/http"
	"os"

	"github.com/codegangsta/negroni"
	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus"

	"github.com/bbhmakerlab/openinnovation/store"
)

func home(w http.ResponseWriter, r *http.Request) {
	r.Header.Set("Content-Type", "text/html")
	http.ServeFile(w, r, "public/main.html")
}

func main() {
	flag.Parse()

	store.Init()

	p := func(name string, handler http.HandlerFunc) http.Handler {
		return prometheus.InstrumentHandler(name, handler)
	}

	router := mux.NewRouter()
	router.Handle("/metrics", prometheus.Handler())
	router.Handle("/", p("/", home))
	router.Handle("/login", p("/login", login))
	router.Handle("/verify", p("/verify", verify))

	apiRouter := mux.NewRouter()
	apiRouter.Handle("/api/logout", p("/logout", logout))
	apiRouter.Handle("/api/user", p("/user", user))
	apiRouter.Handle("/api/user/project", p("/user/project", userProject))
	apiRouter.Handle("/api/project", p("/project", project))
	apiRouter.Handle("/api/project/member", p("/task/member", member))
	apiRouter.Handle("/api/task", p("/task", task))
	apiRouter.Handle("/api/task/worker", p("/task/worker", worker))
	apiRouter.Handle("/api/milestone", p("/milestone", milestone))
	apiRouter.Handle("/api/friend", p("/friend", friend))
	apiRouter.Handle("/api/chat", p("/chat", chat))
	apiRouter.HandleFunc("/api/ws", ws)
	router.PathPrefix("/api").Handler(negroni.New(
		negroni.HandlerFunc(apiMiddleware),
		negroni.Wrap(apiRouter),
	))

	adminRouter := mux.NewRouter()
	adminRouter.Handle("/api/admin/user", p("/admin/user", adminUser))
	adminRouter.Handle("/api/admin/project", p("/admin/project", adminProject))
	router.PathPrefix("/api/admin").Handler(negroni.New(
		negroni.HandlerFunc(adminMiddleware),
		negroni.Wrap(adminRouter),
	))

	go h.run()

	n := negroni.Classic()
	n.UseHandler(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	n.Run(":"+port)
}
