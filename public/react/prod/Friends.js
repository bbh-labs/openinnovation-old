var Friends = React.createClass({displayName: "Friends",
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
			React.createElement(Window, {className: "friends", style: m(this.styles.container, this.props.showFriendsPanel && this.styles.materialize)}, 
				React.createElement(Window.Header, {onClose: this.toggleFriends}, "Friends"), 
				React.createElement(Window.Content, null, 
					React.createElement(Friends.Item, {user: user, activates: "me-dropdown"}), 
					React.createElement(Friends.MeDropdown, null), 
					React.createElement(Friends.List, {user: user})
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
			React.createElement("div", {className: "list", style: m(this.styles.container, {maxHeight: this.state.maxHeight + "px"})}, 
				React.createElement("div", null, 
					React.createElement(Friends.Item, {user: user, activates: "friend-dropdown"}), 
					React.createElement(Friends.Item, {user: user, activates: "friend-dropdown"}), 
					React.createElement(Friends.Item, {user: user, activates: "friend-dropdown"}), 
					React.createElement(Friends.Item, {user: user, activates: "friend-dropdown"}), 
					React.createElement(Friends.Item, {user: user, activates: "friend-dropdown"}), 
					React.createElement(Friends.Item, {user: user, activates: "friend-dropdown"}), 
					React.createElement(Friends.Item, {user: user, activates: "friend-dropdown"})
				), 
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
