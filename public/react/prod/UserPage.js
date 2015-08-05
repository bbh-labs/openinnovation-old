var UserPage = React.createClass({displayName: "UserPage",
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
			return React.createElement("div", null)
		}
		return (
			React.createElement("div", {style: {height: "100%"}}, 
				React.createElement(Header, {user: user}), 
				React.createElement(RouteHandler, {user: user}), 
				React.createElement(Footer, null), 
				React.createElement(Overlay, {user: user, showFriendsPanel: this.state.showFriendsPanel})
			)
		)
	},
});
