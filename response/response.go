package response

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/bbhasiapacific/openinnovation/debug"
)

type responseJSON struct {
	Data    interface{} `json:"data"`
	Message string      `json:"message"`
	Status  string      `json:"status"`
}

func ServerError(w http.ResponseWriter, err error) {
	const status = http.StatusInternalServerError
	http.Error(w, http.StatusText(status), status)
	debug.Log(err)
}

func ClientError(w http.ResponseWriter, status int) {
	http.Error(w, http.StatusText(status), status)
}

func OK(w http.ResponseWriter, data interface{}) {
	resp := responseJSON{data, "", "ok"}
	if out, err := json.Marshal(resp); err != nil {
		fmt.Println("OK:", err)
	} else {
		w.Write(out)
	}
}
