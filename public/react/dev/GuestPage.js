var GuestPage = React.createClass({
	mixins: [ Navigation ],
	componentDidUpdate: function() {
		if (this.props.user) {
			this.transitionTo("dashboard");
		}
	},
	render: function() {
		if (this.props.user) {
			return <div />
		}
		return (
			<RouteHandler />
		)
	},
});
