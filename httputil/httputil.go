package httputil

import (
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"path"
	"os"

	"github.com/bbhmakerlab/openinnovation/debug"
)

const (
	MultipartMaxMemory = 4 * 1024 * 1024
)

func SaveFile(w http.ResponseWriter, r *http.Request, key, destination string) (*multipart.FileHeader, error) {
	if err := r.ParseMultipartForm(MultipartMaxMemory); err != nil {
		debug.Error(err)
		return nil, err
	}

	files := r.MultipartForm.File[key]
	if len(files) == 0 {
		return nil, nil
	}

	header := files[0]

	if err := saveFile(header, destination); err != nil {
		return header, err
	}
	return header, nil
}

func SaveFileWithExtension(w http.ResponseWriter, r *http.Request, key, destination string) (string, *multipart.FileHeader, error) {
	if err := r.ParseMultipartForm(MultipartMaxMemory); err != nil {
		debug.Error(err)
		return "", nil, err
	}

	files := r.MultipartForm.File[key]
	if len(files) == 0 {
		return "", nil, nil
	}

	header := files[0]
	finalURL := destination + path.Ext(header.Filename)

	if err := saveFile(header, finalURL); err != nil {
		return "", header, err
	}

	return finalURL, header, nil
}

func saveFile(header *multipart.FileHeader, destination string) error {
	file, err := header.Open()
	if err != nil {
		return err
	}
	defer file.Close()

	dir := path.Dir(destination)
	if err = os.MkdirAll(dir, os.ModeDir|0700); err != nil {
		return err
	}

	var output *os.File
	if output, err = os.OpenFile(destination, os.O_CREATE|os.O_WRONLY, 0600); err != nil {
		fmt.Println("test:", err)
		return err
	}

	var n int64
	if n, err = io.Copy(output, file); err != nil {
		return err
	}
	log.Println("written", n, "bytes of data to file:", destination)
	return nil
}
