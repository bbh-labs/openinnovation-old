var UserPage = React.createClass({
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
			case "googleClientReady":
				google.initAPIs();
				break;
			}
		}.bind(this));
	},
	componentDidUpdate: function() {
		var user = this.props.user;
		if (!user) {
			this.transitionTo("intro");
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
			return <div />
		}
		var friends = this.state.friends;
		return (
			<div style={this.styles.container}>
				<Header user={user} />
				<RouteHandler user={user} />
				<Footer />
				<Overlay user={user} friends={friends} />
			</div>
		)
	},
	initWS: function() {
		var baseURL = location.href.match(/.*\:\/\/(.*)\/.*/)[1];
		this.ws = new WebSocket("ws://" + baseURL + "/api/ws");
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
