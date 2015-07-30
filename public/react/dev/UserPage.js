var UserPage = React.createClass({
	mixins: [ Navigation ],
	componentDidUpdate: function() {
		if (!this.props.user) {
			this.transitionTo("intro");
		}
	},
	render: function() {
		var user = this.props.user;
		if (!user) {
			return <div />
		}
		return (
			<div>
				<Header user={user} />
				<RouteHandler user={user} />
				<Footer />
			</div>
		)
	},
});
