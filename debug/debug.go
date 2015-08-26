package debug

import (
	"log"
	"runtime"
)

// Log messages
func Log(msg ...interface{}) {
	file, line, fn := trace()
	log.Printf("log: %s(%d): %s: %v\n", file, line, fn, msg)
}

// Prints out warning message along with trace information
func Warn(msg interface{}) {
	file, line, fn := trace()
	log.Printf("warning: %s(%d): %s: %v\n", file, line, fn, msg)
}

// Returns error message along with trace information.
func Error(err error) {
	file, line, fn := trace()
	log.Printf("error: %s(%d): %s: %v\n", file, line, fn, err)
}

func Fatal(err error) {
	file, line, fn := trace()
	log.Fatalf("error: %s(%d): %s: %v\n", file, line, fn, err)
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
