package main

import (
	"encoding/json"
	"time"

	"github.com/bbhasiapacific/bbhoi.com/debug"
	"github.com/bbhasiapacific/bbhoi.com/store"
	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var upgrader = websocket.Upgrader{
	ReadBufferSize: 1024,
	WriteBufferSize: 1024,
}

// connection is an middleman between the websocket connection and the hub.
type connection struct {
	// The websocket connection.
	ws *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte

	// User ID
	userID int64
}

// readPump pumps messages from the websocket connection to the hub.
func (c *connection) readPump() {
	defer func() {
		h.unregister <- c
		c.ws.Close()
	}()

	c.ws.SetReadLimit(maxMessageSize)
	c.ws.SetReadDeadline(time.Now().Add(pongWait))
	c.ws.SetPongHandler(func(string) error { c.ws.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		/*
		_, message, err := c.ws.ReadMessage()
		if err != nil {
			break
		}

		h.process(c, message)
		*/
	}
}

// write writes a message with the given message type and payload.
func (c *connection) write(mt int, payload []byte) error {
	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
	return c.ws.WriteMessage(mt, payload)
}

// writePump pumps messages from the hub to the websocket connection.
func (c *connection) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.ws.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.write(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.write(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			if err := c.write(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}

// hub maintains the set of active connections and broadcasts messages to the
// connections.
type hub struct {
	// Registered connections.
	connections map[int64]*connection

	// Register requests from the connections.
	register chan *connection

	// Unregister requests from connections.
	unregister chan *connection
}

var h = hub{
	register:    make(chan *connection),
	unregister:  make(chan *connection),
	connections: make(map[int64]*connection),
}

func (h *hub) run() {
	for {
		select {
		case c := <-h.register:
			h.connections[c.userID] = c
		case c := <-h.unregister:
			if _, ok := h.connections[c.userID]; ok {
				delete(h.connections, c.userID)
				close(c.send)
			}
		}
	}
}

func (h *hub) process(c *connection, m []byte) {
}

func (h *hub) notifyUser(userID, otherUserID int64, data interface{}) {
	c, ok := h.connections[userID]
	if !ok {
		println("Couldn't find connection", userID)
		return
	}

	m, err := json.Marshal(data)
	if err != nil {
		debug.Warn(err)
		return
	}

	go func() {
		c.send <- m
	}()

	// chatting with yourself so just send the message once
	if userID == otherUserID {
		return
	}

	d, ok := h.connections[otherUserID]
	if !ok {
		println("Couldn't find connection", otherUserID)
		return
	}

	d.send <- m
}

func (h *hub) notifyProject(projectID int64, data interface{}) {
	ids, err := store.GetMemberIDs(projectID)
	if err != nil {
		debug.Warn(err)
		return
	}

	m, err := json.Marshal(data)
	if err != nil {
		debug.Warn(err)
		return
	}

	for _, id := range ids {
		c, ok := h.connections[id]
		if !ok {
			println("Couldn't find connection", id)
			continue
		}

		c.send <- m
	}
}
