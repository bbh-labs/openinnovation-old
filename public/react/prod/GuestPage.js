var GuestPage = React.createClass({displayName: "GuestPage",
	mixins: [ Navigation ],
	componentDidUpdate: function() {
		if (this.props.user) {
			this.transitionTo("dashboard");
		}
	},
	render: function() {
		if (this.props.user) {
			return React.createElement("div", null)
		}
		return (
			React.createElement(RouteHandler, null)
		)
	},
});
