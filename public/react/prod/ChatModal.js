var ChatModal = React.createClass({displayName: "ChatModal",
	getInitialState: function() {
		return {channel: null, messages: []};
	},
	componentDidMount: function() {
		var user = this.props.user;

		this.initWS();

		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "openChatModal":
				var channel = payload.data;
				this.setState({channel: channel});
				OI.getChats({channelID: channel.data.id, channelType: channel.type});
				$(React.findDOMNode(this)).openModal();
				break;
			case "getChatsDone":
				this.setState({messages: payload.data.data});
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var user = this.props.user;
		var channel = this.state.channel;
		var messages = this.state.messages ? this.state.messages : [];
		return (
			React.createElement("div", {className: "modal"}, 
				React.createElement("div", {className: "modal-content"}, 
					channel ?React.createElement("span", {className: "title"}, "To: ", this.channelName()) : "", 
					React.createElement(ChatModal.MessageList, {messages: messages})
				), 
				React.createElement("div", {className: "modal-footer"}, 
					channel ? React.createElement(ChatModal.MessageBox, {user: user, channel: channel, handleSend: this.handleSend}) : ""
				)
			)
		)
	},
	initWS: function() {
		var ws = new WebSocket("ws://localhost:8080/api/ws");
		ws.onclose = function(e) {
			console.log("WebSocket connection closed");
		}
		ws.onopen = function(e) {
			console.log("WebSocket connection opened");
		}
		ws.onmessage = this.handleMessage;
		this.ws = ws;
	},
	handleMessage: function(e) {
		console.log("Got message: " + e.data);
	},
	handleSend: function(e) {
		var elements = e.target.elements;
		var data = {
			userID: this.props.user.id,
			channelID: this.state.channel.data.id,
			channelType: this.state.channel.type,
			text: elements["text"].value,
		}
		console.log(data);

		this.ws.send(JSON.stringify(data));
		e.preventDefault();
	},
	channelName: function() {
		var channel = this.state.channel;
		if (!channel) {
			return "";
		}

		switch (channel.type) {
		case "user":
			return channel.data.fullname;
		case "project":
			return channel.data.title;
		}

		return "";
	},
});

ChatModal.MessageList = React.createClass({displayName: "MessageList",
	render: function() {
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement("div", {className: "col s12"}, 
					this.props.messages.map(function(m) {
						React.createElement("li", null, m.text)
					})
				)
			)
		)
	},
});

ChatModal.MessageBox = React.createClass({displayName: "MessageBox",
	render: function() {
		var user = this.props.user;
		var channel = this.props.channel;
		return (
			React.createElement("form", {className: "row", onSubmit: this.props.handleSend}, 
				React.createElement("div", {className: "input-field col s8"}, 
					React.createElement("textarea", {id: "chat-textarea", className: "materialize-textarea", name: "text"}), 
					React.createElement("label", {htmlFor: "chat-textarea"}, "Message")
				), 
				React.createElement("div", {className: "input-field col s4"}, 
					React.createElement("button", {type: "submit", className: "btn waves-effect waves-light"}, "Send")
				)
			)
		)
	},
});
