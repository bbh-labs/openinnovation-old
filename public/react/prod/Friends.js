var Friends = React.createClass({displayName: "Friends",
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

Friends.List = React.createClass({displayName: "List",
	componentDidMount: function() {
		$(React.findDOMNode(this)).scrollbar();
	},
	render: function() {
		var user = this.props.user;
		return (
			React.createElement("div", {className: "friends-list"}, 
				React.createElement(Friends.List.Item, {user: user}), 
				React.createElement(Friends.List.Item, {user: user}), 
				React.createElement(Friends.List.Item, {user: user}), 
				React.createElement(Friends.List.Item, {user: user}), 
				React.createElement(Friends.List.Item, {user: user}), 
				React.createElement(Friends.List.Item, {user: user}), 
				React.createElement(Friends.List.Item, {user: user}), 
				React.createElement(Friends.List.Item, {user: user})
			)
		)
	},
});

Friends.List.Item = React.createClass({displayName: "Item",
	render: function() {
		var user = this.props.user;
		return (
			React.createElement("div", {className: "item"}, 
				React.createElement("img", {src: user.avatarURL, className: "friends-avatar"}), 
				React.createElement("p", {className: "friends-status"}, 
					user.fullname, React.createElement("br", null), 
					"Online"
				)
			)
		)
	},
});
