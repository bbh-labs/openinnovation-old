var UserPage = React.createClass({
	ws: null,

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
			}
		});
	},
	componentDidUpdate: function() {
		if (!this.props.user) {
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
		var m = JSON.parse(e.data);
		dispatcher.dispatch({
			type: "onWSMessage",
			data: m,
		});
	},
});
