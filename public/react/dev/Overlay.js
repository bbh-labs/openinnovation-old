var Overlay = React.createClass({
	styles: {
		container: {
			position: "fixed",
			width: "100%",
			height: "100%",
			top: 0,
			left: 0,
			zIndex: "2000",
		},
	},
	render: function() {
		var user = this.props.user;
		return (
			<div className="no-pointer-events" style={this.styles.container}>
				<Friends user={user} showFriendsPanel={this.props.showFriendsPanel} />
				<Overlay.Actions showFriendsPanel={this.props.showFriendsPanel} />
			</div>
		)
	},
});

Overlay.Actions = React.createClass({
	styles: {
		container: {
			bottom: "64px",
			right: "64px",
			visibility: "visible",
		},
	},
	render: function() {
		return (
			<div className="fixed-action-btn has-pointer-events" style={m(this.styles.container, this.props.showFriendsPanel && {visibility: "hidden"})}>
				<a href="#" className="btn-floating btn-large red" onClick={this.handleClick}>
					<i className="large material-icons">chat</i>
				</a>
			</div>
		)
	},
	handleClick: function(e) {
		dispatcher.dispatch({type: "toggleFriendsPanel"});

		e.preventDefault()
	},
});
