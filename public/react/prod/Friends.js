var Friends = React.createClass({displayName: "Friends",
	styles: {
		container: {
			position: "absolute",
			width: "300px",
			height: "500px",
			minWidth: "300px",
			minHeight: "500px",
			top: "calc(100% - 600px)",
			left: "calc(100% - 400px)",
			overflow: "hidden",
			pointerEvents: "all",
			transform: "scale(0)",
			transition: "transform .1s",
		},
		content: {
			display: "flex",
			flexDirection: "column",
			overflowY: "auto",
		},
		materialize: {
			transform: "scale(1)",
		},
	},
	getInitialState: function() {
		return {users: []};
	},
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "getFriendsDone":
				this.setState({users: payload.data.data});
				break;
			}
		}.bind(this));

		OI.getFriends({userID: this.props.user.id});
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var user = this.props.user;
		return (
			React.createElement(Window, {className: "friends", style: m(this.styles.container, this.props.showFriendsPanel && this.styles.materialize)}, 
				React.createElement(Window.Header, {onClose: this.toggleFriends}, "Friends"), 
				React.createElement(Window.Content, {style: this.styles.content}, 
					React.createElement(Friends.Item, {user: user, activates: "me-dropdown"}), 
					React.createElement(Friends.MeDropdown, null), 
					React.createElement(Friends.List, {user: user, users: this.state.users})
				), 
				React.createElement(Window.Footer, null
				)
			)
		)
	},
	toggleFriends: function() {
		dispatcher.dispatch({type: "toggleFriendsPanel"});
	},
});

Friends.Item = React.createClass({displayName: "Item",
	styles: {
		container: {
			flex: "0 auto",
			margin: "8px",
		},
		avatar: {
			display: "inline-block",
			width: "64px",
			margin: "0 8px",
			border: "2px solid #808080",
		},
		userInfo: {
			display: "inline-block",
			margin: "0",
			verticalAlign: "top",
		},
		dropdownButton: {
			cursor: "pointer",
		},
	},
	componentDidMount: function() {
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
			React.createElement("div", {className: "item", style: this.styles.container}, 
				React.createElement("img", {src: user.avatarURL, style: this.styles.avatar}), 
				React.createElement("p", {style: this.styles.userInfo}, 
					user.fullname, 
					React.createElement("span", {ref: "dropdownButton", style: this.styles.dropdownButton, "data-activates": this.props.activates, onClick: this.handleClick}, " ⌄"), React.createElement("br", null), 
					"Online"
				)
			)
		)
	},
	handleClick: function(e) {
		dispatcher.dispatch({type: "openDropdown", data: this.props.user});
	},
});

Friends.List = React.createClass({displayName: "List",
	styles: {
		container: {
			flex: "1 1 auto",
			overflowY: "scroll",
			background: "linear-gradient(#f0f0f0, #ffffff)",
			border: "1px solid #f0f0f0",
		},
	},
	render: function() {
		var user = this.props.user;
		return (
			React.createElement("div", {className: "list", style: this.styles.container}, 
			
				this.props.users ?
				this.props.users.map(function(u) {
					return React.createElement(Friends.Item, {user: u, activates: "friend-dropdown"})
				}) : "", 
			
				React.createElement(Friends.FriendDropdown, null)
			)
		)
	},
});

Friends.MeDropdown = React.createClass({displayName: "MeDropdown",
	user: null,
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "openDropdown":
				this.user = payload.data;
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		return (
			React.createElement("ul", {id: "me-dropdown", className: "dropdown-content"}, 
				React.createElement("li", null, React.createElement("a", {href: "#"}, "Online")), 
				React.createElement("li", null, React.createElement("a", {href: "#"}, "Away")), 
				React.createElement("li", null, React.createElement("a", {href: "#"}, "Busy")), 
				React.createElement("li", {className: "divider"}, "View Profile"), 
				React.createElement("li", null, React.createElement("a", {href: "#"}, "Edit Profile"))
			)
		)
	},
	handleOpenChat: function(e) {
		dispatcher.dispatch({
			type: "openChat",
			data: this.user,
		});

		e.preventDefault();
	},
});

Friends.FriendDropdown = React.createClass({displayName: "FriendDropdown",
	user: null,
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "openDropdown":
				this.user = payload.data;
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		return (
			React.createElement("ul", {id: "friend-dropdown", className: "dropdown-content"}, 
				React.createElement("li", null, React.createElement("a", {href: "#", onClick: this.handleOpenChat}, "Send Message")), 
				React.createElement("li", null, React.createElement("a", {href: "#"}, "View Profile"))
			)
		)
	},
	handleOpenChat: function(e) {
		dispatcher.dispatch({
			type: "openChat",
			data: this.user,
		});

		e.preventDefault();
	},
});

Friends.Chat = React.createClass({displayName: "Chat",
	getInitialState: function() {
		return {messages: []};
	},
	styles: {
		container: {
			position: "absolute",
			width: "500px",
			height: "300px",
			minWidth: "500px",
			minHeight: "300px",
			top: "calc(80% - 400px)",
			left: "calc(80% - 600px)",
			pointerEvents: "all",
		},
		content: {
			display: "flex",
			flexDirection: "column",
			overflowY: "auto",
		},
	},
	componentDidMount: function() {
		var user = this.props.user;
		var otherUser = this.props.otherUser;

		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "doFetchNewMessages":
				var m = payload.data;
				if (!(m.channelType == "user" && m.channelID == otherUser.id)) {
					break;
				}

				var startID = 0;
				var messages = this.state.messages;
				if (messages) {
					startID = messages[messages.length - 1].id;
					console.log(startID);
				}
				OI.getChatMessages({channelID: otherUser.id, channelType: "user", startID: startID, count: -1});
				break;
			case "getChatMessagesDone":
				var messages = this.state.messages;
				var data = payload.data.data;
				if (messages.length > 0 && data) {
					messages = messages.concat(data);
					this.props.playChatSound();
					this.refs.list.scrollToBottom();
				} else if (messages.length == 0) {
					messages = data;
				}
				this.setState({messages: messages});
				break;
			}
		}.bind(this));

		$(React.findDOMNode(this)).draggable().resizable();

		OI.getChatMessages({channelID: otherUser.id, channelType: "user"});
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var user = this.props.user;
		var otherUser = this.props.otherUser;
		return (
			React.createElement(Window, {className: "chat", style: this.styles.container}, 
				React.createElement(Window.Header, {onClose: this.handleClose}, otherUser.fullname), 
				React.createElement(Window.Content, {style: this.styles.content}, 
					React.createElement(Friends.Chat.Header, {otherUser: otherUser}), 
					React.createElement(Friends.Chat.List, {ref: "list", user: user, otherUser: otherUser, messages: this.state.messages}), 
					React.createElement(Friends.Chat.Input, {user: user, otherUser: otherUser})
				)
			)
		)
	},
	handleClose: function() {
		dispatcher.dispatch({type: "closeChat", data: this.props.windowID});
	},
});

Friends.Chat.Header = React.createClass({displayName: "Header",
	styles: {
		container: {
			margin: "8px",
		},
		avatar: {
			display: "inline-block",
			width: "64px",
			border: "2px solid #808080",
		},
		userInfo: {
			display: "inline-block",
			margin: "0 8px",
			verticalAlign: "top",
		},
	},
	render: function() {
		var otherUser = this.props.otherUser;
		return (
			React.createElement("div", {className: "item", style: this.styles.container}, 
				React.createElement("img", {src: otherUser.avatarURL, style: this.styles.avatar}), 
				React.createElement("p", {style: this.styles.userInfo}, 
					otherUser.fullname, 
					React.createElement("span", null, " ⌄"), React.createElement("br", null), 
					"Online"
				)
			)
		)
	},
});

Friends.Chat.List = React.createClass({displayName: "List",
	styles: {
		container: {
			flex: "1 auto",
			border: "1px solid #f7f7f7",
			margin: "8px",
			background: "linear-gradient(#f0f0f0, #ffffff)",
			overflowY: "scroll",
		},
		text: {
			padding: "0",
			margin: "0 8px",
		},
	},
	render: function() {
		return (
			React.createElement("div", {className: "list", style: this.styles.container}, 
				this.props.messages ?
				this.props.messages.map(function(m) {
					return React.createElement("p", {style: this.styles.text}, React.createElement("strong", null, this.getUsername(m), ": "), m.text)
				}.bind(this)) : ""
			)
		)
	},
	getUsername: function(m) {
		var user = this.props.user;
		if (m.userID == user.id) {
			return user.fullname;
		}
		var otherUser = this.props.otherUser;
		return otherUser.fullname;
	},
	scrollToBottom: function() {
		var list = React.findDOMNode(this);
		$(list).scrollTop(list.scrollHeight);
	},
});

Friends.Chat.Input = React.createClass({displayName: "Input",
	styles: {
		container: {
			display: "flex",
			margin: "16px 8px",
		},
		textarea: {
			minHeight: "100px",
			maxHeight: "100px",
		},
	},
	render: function() {
		return (
			React.createElement("form", {style: this.styles.container}, 
				React.createElement("textarea", {ref: "textarea", style: this.styles.textarea, onKeyPress: this.handleKeyPress}), 
				React.createElement("button", {onClick: this.handleClick}, "Send")
			)
		)
	},
	handleKeyPress: function(e) {
		if (e.charCode == 13) {
			this.sendMessage();
			e.preventDefault();
		}
	},
	handleClick: function(e) {
		this.sendMessage();
		e.preventDefault();
	},
	sendMessage: function() {
		var textarea = React.findDOMNode(this.refs.textarea);

		OI.postChatMessage({
			userID: this.props.user.id,
			channelID: this.props.otherUser.id,
			channelType: "user",
			text: textarea.value,
		});

		textarea.value = '';
	},
});
