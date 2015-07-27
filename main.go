package main

import (
	"net/http"

	"github.com/codegangsta/negroni"
	"github.com/gorilla/mux"
	"github.com/PuerkitoBio/throttled"

	_ "bbhoi.com/store"
)

var (
	LowThrottle = throttled.Interval(throttled.PerSec(10), 100, &throttled.VaryBy{Path: true}, 50)
	MediumThrottle = throttled.Interval(throttled.PerSec(5), 50, &throttled.VaryBy{Path: true}, 25)
	HighThrottle = throttled.Interval(throttled.PerSec(1), 10, &throttled.VaryBy{Path: true}, 5)
)

func lt(f http.HandlerFunc) http.Handler {
	return LowThrottle.Throttle(http.Handler(f))
}

func mt(f http.HandlerFunc) http.Handler {
	return MediumThrottle.Throttle(http.Handler(f))
}

func ht(f http.HandlerFunc) http.Handler {
	return HighThrottle.Throttle(http.Handler(f))
}

func home(w http.ResponseWriter, r *http.Request) {
	r.Header.Set("Content-Type", "text/html")
	http.ServeFile(w, r, "public/main.html")
}

func main() {
	router := mux.NewRouter()
	router.Handle("/", ht(home))
	router.Handle("/login", ht(login))
	router.Handle("/register", ht(register))
	router.Handle("/verify", ht(verify))

	apiRouter := mux.NewRouter()
	apiRouter.Handle("/api/logout", ht(logout))
	apiRouter.Handle("/api/user", ht(user))
	apiRouter.Handle("/api/project", ht(project))
	router.PathPrefix("/api").Handler(negroni.New(
		negroni.HandlerFunc(apiMiddleware),
		negroni.Wrap(apiRouter),
	))

	adminRouter := mux.NewRouter()
	adminRouter.Handle("/api/admin/user", ht(adminUser))
	adminRouter.Handle("/api/admin/project", ht(adminProject))
	router.PathPrefix("/api/admin").Handler(negroni.New(
		negroni.HandlerFunc(adminMiddleware),
		negroni.Wrap(adminRouter),
	))

	n := negroni.Classic()
	n.UseHandler(router)
	n.Run(":8080")
}
