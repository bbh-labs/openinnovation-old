var UserPage = React.createClass({displayName: "UserPage",
	mixins: [ Navigation ],
	componentDidUpdate: function() {
		if (!this.props.user) {
			this.transitionTo("intro");
		}
	},
	render: function() {
		var user = this.props.user;
		if (!user) {
			return React.createElement("div", null)
		}
		return (
			React.createElement("div", null, 
				React.createElement(Header, {user: user}), 
				React.createElement(RouteHandler, {user: user}), 
				React.createElement(Footer, null)
			)
		)
	},
});
