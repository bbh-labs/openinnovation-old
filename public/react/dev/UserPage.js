var UserPage = React.createClass({
	ws: null,

	mixins: [ Navigation ],
	getInitialState: function() {
		return {friends: []};
	},
	componentDidMount: function() {
		this.initWS();
	},
	componentDidUpdate: function() {
		if (!this.props.user) {
			this.transitionTo("intro");
		}
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var user = this.props.user;
		if (!user) {
			return <div />
		}
		var friends = this.state.friends;
		return (
			<div style={{height: "100%"}}>
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
	},
	onWSMessage: function(e) {
		var m = JSON.parse(e.data);
		console.log(m);
	},
});
