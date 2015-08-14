Friends.Users = React.createClass({displayName: "Users",
	styles: {
		container: {
			flex: "1 1 auto",
			display: "none",
			overflowY: "scroll",
			background: "linear-gradient(#f0f0f0, #ffffff)",
			border: "1px solid #f0f0f0",
		},
	},
	render: function() {
		var user = this.props.user;
		return (
			React.createElement("div", {id: "users", style: m(this.styles.container, this.props.style)}, 
			
				this.props.users ?
				this.props.users.map(function(u) {
					return React.createElement(Friends.UserItem, {key: u.id, user: u, activates: "friend-dropdown"})
				}) : ""
			
			)
		)
	},
});

Friends.UserItem = React.createClass({displayName: "UserItem",
	styles: {
		container: {
			flex: "0 auto",
			margin: "8px",
			position: "relative",
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
				), 
				React.createElement(Friends.UserDropdown, null)
			)
		)
	},
	handleClick: function(e) {
		dispatcher.dispatch({type: "openUserDropdown", data: this.props.user});
	},
});

Friends.MeDropdown = React.createClass({displayName: "MeDropdown",
	user: null,
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "openUserDropdown":
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
				React.createElement("li", null, React.createElement("a", {href: "#"}, "Busy"))
			)
		)
	},
	handleOpenChat: function(e) {
		dispatcher.dispatch({
			type: "openUserChat",
			data: this.user,
		});

		e.preventDefault();
	},
});

Friends.UserDropdown = React.createClass({displayName: "UserDropdown",
	user: null,
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "openUserDropdown":
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
			type: "openUserChat",
			data: this.user,
		});

		e.preventDefault();
	},
});

Friends.UserChat = React.createClass({displayName: "UserChat",
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
			case "newChatMessage":
				var m = payload.data;
				if (!(m.channelType == "user" && (m.channelID == otherUser.id || m.userID == otherUser.id))) {
					break;
				}

				var startID = 0;
				var messages = this.state.messages;
				if (messages) {
					if (messages.length > 0) {
						startID = messages[messages.length - 1].id;
					}
				}
				OI.getChatMessages({channelID: otherUser.id, channelType: "user", startID: startID, count: -1});
				break;
			case "getChatMessagesDone":
				var messages = this.state.messages;
				if (messages) {
					var data = payload.data.data;
					if (messages.length > 0 && data) {
						messages = messages.concat(data);
						this.refs.list.scrollToBottom();
					} else if (messages.length == 0) {
						messages = data;
					}
					this.setState({messages: messages});
				}
				break;
			}
		}.bind(this));

		$(React.findDOMNode(this)).draggable().resizable();

		OI.getChatMessages({channelID: otherUser.id, channelType: "user", count: -1});
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
					React.createElement(Friends.UserChat.Header, {otherUser: otherUser}), 
					React.createElement(Friends.UserChat.List, {ref: "list", user: user, otherUser: otherUser, messages: this.state.messages}), 
					React.createElement(Friends.UserChat.Input, {user: user, otherUser: otherUser})
				)
			)
		)
	},
	handleClose: function() {
		dispatcher.dispatch({type: "closeUserChat", data: this.props.windowID});
	},
});

Friends.UserChat.Header = React.createClass({displayName: "Header",
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

Friends.UserChat.List = React.createClass({displayName: "List",
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

Friends.UserChat.Input = React.createClass({displayName: "Input",
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
