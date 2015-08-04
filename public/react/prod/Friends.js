var Friends = React.createClass({displayName: "Friends",
	render: function() {
		return React.createElement("div", null)
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
