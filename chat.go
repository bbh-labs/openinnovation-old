package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"bbhoi.com/debug"
	"bbhoi.com/response"
	"bbhoi.com/store"
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

func GetChats(w http.ResponseWriter, r *http.Request) {
	var parser store.Parser

	channelID := parser.Int(r.FormValue("channelID"))
	if parser.Err != nil {
		response.ClientError(w, http.StatusBadRequest)
		return
	}

	channelType := r.FormValue("channelType")

	chats, err := store.GetChats(channelID, channelType)
	if err != nil {
		response.ServerError(w, err)
		return
	}

	response.OK(w, chats)
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
		_, message, err := c.ws.ReadMessage()
		if err != nil {
			break
		}
		
		h.store(c, message)
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

func (h *hub) store(c *connection, m []byte) {
	var params store.InsertChatParams

	if err := json.Unmarshal(m, &params); err != nil {
		debug.Warn(err)
		return
	}

	id, err := store.InsertChat(params)
	if err != nil {
		debug.Warn(err)
		return
	}

	if err := store.NotifyChat(store.NotifyChatParams{id, params}); err != nil {
		debug.Warn(err)
		return
	}
}

func (h *hub) broadcast(id, userID, channelID int64, channelType string) {
	c, err := store.GetChat(id)
	if err != nil {
		debug.Warn(err)
		return
	}

	m, err := json.Marshal(c)
	if err != nil {
		debug.Warn(err)
		return
	}

	switch channelType {
	case "user":
		c := h.connections[channelID]
		c.send <- m
	default:
	}
}

// format: userID/channelID/channelType
func onNotify(channel, extra string) {
	params := strings.Split(extra, "_")
	if len(params) < 5 {
		return
	}

	var parser store.Parser
	id := parser.Int(params[1])
	userID := parser.Int(params[2])
	channelID := parser.Int(params[3])
	channelType := params[4]

	h.broadcast(id, userID, channelID, channelType)
}

func init() {
	store.Notify = onNotify
}
