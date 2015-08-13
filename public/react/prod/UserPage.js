var UserPage = React.createClass({displayName: "UserPage",
	ws: null,
	chatSound: new Audio("sounds/message.wav"),

	styles: {
		container: {
			height: "100%",
		},
	},
	mixins: [ Navigation ],
	getInitialState: function() {
		return {friends: []};
	},
	componentDidMount: function() {
		this.initWS();

		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "sendWSMessage":
				if (this.ws) {
					this.ws.send(JSON.stringify(payload.data));
				}
				break;
			case "googleClientIsReady":
				initGoogleAPIs();
				break;
			}
		}.bind(this));
	},
	componentDidUpdate: function() {
		var user = this.props.user;
		if (!user) {
			this.transitionTo("intro");
			return;
		}
	},
	componentWillUnmount: function() {
		if (this.ws) {
			this.ws.close();
		}
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var user = this.props.user;
		if (!user) {
			return React.createElement("div", null)
		}
		var friends = this.state.friends;
		return (
			React.createElement("div", {style: this.styles.container}, 
				React.createElement(Header, {user: user}), 
				React.createElement(RouteHandler, {user: user}), 
				React.createElement(Footer, null), 
				React.createElement(Overlay, {user: user, friends: friends})
			)
		)
	},
	initWS: function() {
		this.ws = new WebSocket("ws://localhost:8080/api/ws");
		this.ws.onclose = this.onWSClose;
		this.ws.onopen = this.onWSOpen; 
		this.ws.onmessage = this.onWSMessage;
	},
	onWSOpen: function(e) {
		console.log("WebSocket connection opened");
	},
	onWSClose: function(e) {
		console.log("WebSocket connection closed");
		this.ws = null;
	},
	onWSMessage: function(e) {
		var msg = JSON.parse(e.data);
		dispatcher.dispatch(msg);

		// play sound when a chat message is received
		if (msg.type == "newChatMessage" && msg.data.userID != this.props.user.id) {
			if (this.chatSound) {
				this.chatSound.play();
			}
		}
	},
});
