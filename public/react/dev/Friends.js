var Friends = React.createClass({
	styles: {
		container: {
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
		materialize: {
			transform: "scale(1)",
		},
	},
	render: function() {
		var user = this.props.user;
		return (
			<Window className="friends" style={m(this.styles.container, this.props.showFriendsPanel && this.styles.materialize)}>
				<Window.Header onClose={this.toggleFriends}>Friends</Window.Header>
				<Window.Content>
					<Friends.Item user={user} activates="me-dropdown" />
					<Friends.MeDropdown />
					<Friends.List user={user} />
				</Window.Content>
			</Window>
		)
	},
	toggleFriends: function() {
		dispatcher.dispatch({type: "toggleFriendsPanel"});
	},
});

Friends.Item = React.createClass({
	styles: {
		container: {
			padding: "8px",
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
			</div>
		)
	},
	handleClick: function(e) {
		dispatcher.dispatch({type: "openDropdown", data: this.props.user});
	},
});

Friends.List = React.createClass({
	styles: {
		container: {
			background: "linear-gradient(#ffffff, #f0f0f0)",
			overflowY: "scroll",
		},
	},
	getInitialState: function() {
		return {maxHeight: 350};
	},
	componentDidMount: function(e) {
		$("body").on("resize", ".friends", function(e, ui) {
			var h = ui.size.height > ui.originalSize.height ? ui.size.height : ui.originalSize.height;
			this.setState({maxHeight: h - 150});
		}.bind(this));
	},
	componentWillUnmount: function(e) {
		$("body").off("resize", ".friends");
	},
	render: function() {
		var user = this.props.user;
		return (
			<div className="list" style={m(this.styles.container, {maxHeight: this.state.maxHeight + "px"})}>
				<div>
					<Friends.Item user={user} activates="friend-dropdown"/>
					<Friends.Item user={user} activates="friend-dropdown"/>
					<Friends.Item user={user} activates="friend-dropdown"/>
					<Friends.Item user={user} activates="friend-dropdown"/>
					<Friends.Item user={user} activates="friend-dropdown"/>
					<Friends.Item user={user} activates="friend-dropdown"/>
					<Friends.Item user={user} activates="friend-dropdown"/>
				</div>
				<Friends.FriendDropdown />
			</div>
		)
	},
});

Friends.MeDropdown = React.createClass({
	user: null,
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "openFriendDropdown":
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

Friends.FriendDropdown = React.createClass({
	user: null,
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "openFriendDropdown":
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

/*
var Friends = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this)).draggable({stack: ".friends"}).resizable();
	},
	render: function() {
		var user = this.props.user;
		var friends = this.props.friends;
		return (
			<div className="friends window z-depth-2 has-pointer-events" style={{visibility: this.props.showFriendsPanel ? "visible" : "hidden"}}>
				<div className="window-header materialize-red">
					<div className="left">
						Friends
					</div>
					<div className="right">
						<a href="#" onClick={this.togglePanel}><i className="material-icons">close</i></a>
					</div>
				</div>
				<div className="friends-myprofile">
					<Friends.List.MyProfileItem user={user} />
					<Friends.MyProfileDropdown />
				</div>
				<Friends.List user={user} friends={friends} />
				<Friends.FriendDropdown />
			</div>
		)
	},
	togglePanel: function(e) {
		dispatcher.dispatch({type: "toggleFriendsPanel"});

		e.preventDefault();
	},
});

Friends.List = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this)).scrollbar();
	},
	render: function() {
		var friends = [
			this.props.user,
			this.props.user,
			this.props.user,
			this.props.user,
			this.props.user,
			this.props.user,
			this.props.user,
			this.props.user,
		];
		return (
			<div className="friends-list">{
				friends ?
				friends.map(function(f) {
					return <Friends.List.FriendItem friend={f} />
				}) : ""
			}</div>
		)
	},
});

Friends.List.MyProfileItem = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.dropdownButton)).dropdown();
	},
	render: function() {
		var user = this.props.user;
		return (
			<div className="item">
				<img src={user.avatarURL} className="avatar" />
				<p className="status">
					{user.fullname} <span ref="dropdownButton" className="friends-dropdown-button" data-activates="myprofile-dropdown">&#8964;</span><br/>
					Online
				</p>
			</div>
		)
	},
});

Friends.List.FriendItem = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.dropdownButton)).dropdown();
	},
	render: function() {
		var friend = this.props.friend;
		return (
			<div className="item">
				<img src={friend.avatarURL} className="avatar" />
				<p className="status">
					{friend.fullname} <span ref="dropdownButton" className="friends-dropdown-button" data-activates="friend-dropdown" onClick={this.handleClick}>&#8964;</span><br/>
					Online
				</p>
			</div>
		)
	},
	handleClick: function(e) {
		dispatcher.dispatch({type: "openFriendDropdown", data: this.props.friend});
	},
});

Friends.Chat = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this)).draggable({stack: ".friends-chat"}).resizable();
	},
	render: function() {
		var user = this.props.user;
		return (
			<div className="friends-chat window z-depth-2 has-pointer-events">
				<div className="window-header materialize-red">
					<div className="left">
						{user.fullname}
					</div>
					<div className="right">
						<a href="#" onClick={this.handleCloseChat}><i className="material-icons">close</i></a>
					</div>
				</div>
				<div className="col s12">
					<img src={user.avatarURL} className="avatar" />
					<p className="status">
						{user.fullname} <span ref="dropdownButton" className="friends-dropdown-button" data-activates="friend-dropdown" onClick={this.handleClick}>&#8964;</span><br/>
						Online
					</p>
				</div>
				<Friends.Chat.List user={user} />
			</div>
		)
	},
	handleCloseChat: function(e) {
		dispatcher.dispatch({type: "closeChat", data: this.props.windowID});

		e.preventDefault();
	},
});

Friends.Chat.List = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this)).scrollbar();
	},
	render: function() {
		var user = this.props.user;
		return (
			<div className="col s12">
				<p><span>{user.fullname}: </span>Lorem ipsum dolor sit amet</p>
				<p><span>{user.fullname}: </span>Lorem ipsum dolor sit amet</p>
				<p><span>{user.fullname}: </span>Lorem ipsum dolor sit amet</p>
				<p><span>{user.fullname}: </span>Lorem ipsum dolor sit amet</p>
				<p><span>{user.fullname}: </span>Lorem ipsum dolor sit amet</p>
				<p><span>{user.fullname}: </span>Lorem ipsum dolor sit amet</p>
				<p><span>{user.fullname}: </span>Lorem ipsum dolor sit amet</p>
				<p><span>{user.fullname}: </span>Lorem ipsum dolor sit amet</p>
				<p><span>{user.fullname}: </span>Lorem ipsum dolor sit amet</p>
			</div>
		)
	},
});
*/
