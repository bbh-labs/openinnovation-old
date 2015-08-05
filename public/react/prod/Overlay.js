var Overlay = React.createClass({displayName: "Overlay",
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
			React.createElement("div", {className: "no-pointer-events", style: this.styles.container}, 
				React.createElement(Friends, {user: user, showFriendsPanel: this.props.showFriendsPanel}), 
				React.createElement(Overlay.Actions, {showFriendsPanel: this.props.showFriendsPanel})
			)
		)
	},
});

Overlay.Actions = React.createClass({displayName: "Actions",
	styles: {
		container: {
			bottom: "64px",
			right: "64px",
			visibility: "visible",
		},
	},
	render: function() {
		return (
			React.createElement("div", {className: "fixed-action-btn has-pointer-events", style: m(this.styles.container, this.props.showFriendsPanel && {visibility: "hidden"})}, 
				React.createElement("a", {href: "#", className: "btn-floating btn-large red", onClick: this.handleClick}, 
					React.createElement("i", {className: "large material-icons"}, "chat")
				)
			)
		)
	},
	handleClick: function(e) {
		dispatcher.dispatch({type: "toggleFriendsPanel"});

		e.preventDefault()
	},
});
