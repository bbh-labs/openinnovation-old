package formutil

import (
	"net/http"
	"strconv"
)

func Number(r *http.Request, name string) (int64, error) {
	return strconv.ParseInt(r.FormValue(name), 10, 0)
}
