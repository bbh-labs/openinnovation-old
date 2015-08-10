Friends.Users = React.createClass({
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
			<div id="users" style={m(this.styles.container, this.props.style)}>
			{
				this.props.users ?
				this.props.users.map(function(u) {
					return <Friends.UserItem key={u.id} user={u} activates="friend-dropdown"/>
				}) : ""
			}
			</div>
		)
	},
});

Friends.UserItem = React.createClass({
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
			<div className="item" style={this.styles.container}>
				<img src={user.avatarURL} style={this.styles.avatar} />
				<p style={this.styles.userInfo}>
					{user.fullname}
					<span ref="dropdownButton" style={this.styles.dropdownButton} data-activates={this.props.activates} onClick={this.handleClick}> &#8964;</span><br/>
					Online
				</p>
				<Friends.UserDropdown />
			</div>
		)
	},
	handleClick: function(e) {
		dispatcher.dispatch({type: "openUserDropdown", data: this.props.user});
	},
});

Friends.MeDropdown = React.createClass({
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
			<ul id="me-dropdown" className="dropdown-content">
				<li><a href="#">Online</a></li>
				<li><a href="#">Away</a></li>
				<li><a href="#">Busy</a></li>
				<li className="divider">View Profile</li>
				<li><a href="#">Edit Profile</a></li>
			</ul>
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

Friends.UserDropdown = React.createClass({
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
			<ul id="friend-dropdown" className="dropdown-content">
				<li><a href="#" onClick={this.handleOpenChat}>Send Message</a></li>
				<li><a href="#">View Profile</a></li>
			</ul>
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

Friends.UserChat = React.createClass({
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

		OI.getChatMessages({channelID: otherUser.id, channelType: "user", count: -1});
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var user = this.props.user;
		var otherUser = this.props.otherUser;
		return (
			<Window className="chat" style={this.styles.container}>
				<Window.Header onClose={this.handleClose}>{otherUser.fullname}</Window.Header>
				<Window.Content style={this.styles.content}>
					<Friends.UserChat.Header otherUser={otherUser} />
					<Friends.UserChat.List ref="list" user={user} otherUser={otherUser} messages={this.state.messages} />
					<Friends.UserChat.Input user={user} otherUser={otherUser} />
				</Window.Content>
			</Window>
		)
	},
	handleClose: function() {
		dispatcher.dispatch({type: "closeChat", data: this.props.windowID});
	},
});

Friends.UserChat.Header = React.createClass({
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
			<div className="item" style={this.styles.container}>
				<img src={otherUser.avatarURL} style={this.styles.avatar} />
				<p style={this.styles.userInfo}>
					{otherUser.fullname}
					<span> &#8964;</span><br/>
					Online
				</p>
			</div>
		)
	},
});

Friends.UserChat.List = React.createClass({
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
			<div className="list" style={this.styles.container}>{
				this.props.messages ?
				this.props.messages.map(function(m) {
					return <p style={this.styles.text}><strong>{this.getUsername(m)}: </strong>{m.text}</p>
				}.bind(this)) : ""
			}</div>
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

Friends.UserChat.Input = React.createClass({
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
			<form style={this.styles.container}>
				<textarea ref="textarea" style={this.styles.textarea} onKeyPress={this.handleKeyPress}></textarea>
				<button onClick={this.handleClick}>Send</button>
			</form>
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
