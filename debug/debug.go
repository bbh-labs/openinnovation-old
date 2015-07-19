package debug

import (
	"fmt"
	"log"
	"runtime"
)

// Log messages
func Log(data ...interface{}) {
	log.Println(data)
}

// Prints out warning message along with trace information
func Warn(msg interface{}) {
	if msg == nil {
		return
	}
	file, line, fn := trace()
	fmt.Printf("warning: %s(%d): %s: %v\n", file, line, fn, msg)
}

// Returns error message along with trace information.
func Error(err error) error {
	if err == nil {
		return nil
	}
	file, line, fn := trace()
	return fmt.Errorf("%s(%d): %s: %v\n", file, line, fn, err)
}

// Prints error and exits the application
func Fatal(err error) {
	log.Fatal(Error(err))
}

// Trace current function name along with its file and line number
func trace() (file string, line int, funcName string) {
	pc := make([]uintptr, 10)
	runtime.Callers(3, pc)
	fn := runtime.FuncForPC(pc[0])
	file, line = fn.FileLine(pc[0])
	funcName = fn.Name()
	return
}
