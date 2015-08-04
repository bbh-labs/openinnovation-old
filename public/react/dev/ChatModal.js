var ChatModal = React.createClass({
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
			<div className="modal">
				<div className="modal-content">
					{channel ?<span className="title">To: {this.channelName()}</span> : ""}
					<ChatModal.MessageList messages={messages} />
				</div>
				<div className="modal-footer">
					{channel ? <ChatModal.MessageBox user={user} channel={channel} handleSend={this.handleSend} /> : ""}
				</div>
			</div>
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

ChatModal.MessageList = React.createClass({
	render: function() {
		return (
			<div className="row">
				<div className="col s12">{
					this.props.messages.map(function(m) {
						<li>{m.text}</li>
					})
				}</div>
			</div>
		)
	},
});

ChatModal.MessageBox = React.createClass({
	render: function() {
		var user = this.props.user;
		var channel = this.props.channel;
		return (
			<form className="row" onSubmit={this.props.handleSend}>
				<div className="input-field col s8">
					<textarea id="chat-textarea" className="materialize-textarea" name="text"></textarea>
					<label htmlFor="chat-textarea">Message</label>
				</div>
				<div className="input-field col s4">
					<button type="submit" className="btn waves-effect waves-light">Send</button>
				</div>
			</form>
		)
	},
});
