package store

import (
	"strconv"
	"time"
)

type Parser struct {
	Err error
}

func (p *Parser) Int(s string) int64 {
	if p.Err != nil {
		return 0
	}

	var n int64
	n, p.Err = strconv.ParseInt(s, 10, 0)
	return n
}

func (p *Parser) Time(s string) time.Time {
	if p.Err != nil {
		return time.Time{}
	}

	var t time.Time
	t, p.Err = time.Parse(`2 January, 2006`, s)
	return t
}

func (p *Parser) Bool(s string) bool {
	if p.Err != nil {
		return false
	}

	return s == "true"
}
