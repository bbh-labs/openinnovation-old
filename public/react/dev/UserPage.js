var UserPage = React.createClass({
	mixins: [ Navigation ],
	getInitialState: function() {
		return {showFriendsPanel: false};
	},
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "toggleFriendsPanel":
				this.setState({showFriendsPanel: !this.state.showFriendsPanel});
				break;
			}
		}.bind(this));
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
		return (
			<div style={{height: "100%"}}>
				<Header user={user} />
				<RouteHandler user={user} />
				<Footer />
				<ChatOverlay user={user} showFriendsPanel={this.state.showFriendsPanel} />
			</div>
		)
	},
});
