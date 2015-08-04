var ChatOverlay = React.createClass({displayName: "ChatOverlay",
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
				React.createElement(ChatOverlay.Box, {user: user, showFriendsPanel: this.props.showFriendsPanel}), 
				React.createElement(ChatOverlay.Actions, {showFriendsPanel: this.props.showFriendsPanel})
			)
		)
	},
});

ChatOverlay.Box = React.createClass({displayName: "Box",
	componentDidMount: function() {
		$(React.findDOMNode(this)).draggable().resizable();
		$(React.findDOMNode(this.refs.dropdownButton)).dropdown({
			inDuration: 300,
			outDuration: 225,
			constrain_width: false,
			gutter: 0,
			belowOrigin: true,
		});
	},
	render: function() {
		var user = this.props.user;
		return (
			React.createElement("div", {className: "friends-panel z-depth-2 has-pointer-events", style: {visibility: this.props.showFriendsPanel ? "visible" : "hidden"}}, 
				React.createElement("div", {className: "friends-header materialize-red"}, 
					React.createElement("div", {className: "left"}, 
						"Friends"
					), 
					React.createElement("div", {className: "right"}, 
						React.createElement("a", {href: "#", onClick: this.togglePanel}, React.createElement("i", {className: "material-icons"}, "close"))
					)
				), 
				React.createElement("div", {className: "friends-myprofile"}, 
					React.createElement(Friends.List.Item, {user: user})
				), 
				React.createElement(Friends.List, {user: user})
			)
		)
	},
	togglePanel: function(e) {
		dispatcher.dispatch({type: "toggleFriendsPanel"});

		e.preventDefault();
	},
});

ChatOverlay.Actions = React.createClass({displayName: "Actions",
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
