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
		tabContent: {
			display: "flex",
			flexDirection: "row",
			flex: "1 1 auto",
		},
		tabContainer: {
			margin: 0,
		},
		tab: {
			display: "inline-block",
			padding: "0 16px",
			margin: 0,
			background: "#e0e0e0",
			cursor: "pointer",
		},
		tabActive: {
			background: "#f0f0f0",
		},
	},
	getInitialState: function() {
		return {users: [], projects: [], tab: "users"};
	},
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "getFriendsDone":
				this.setState({users: payload.data.data});
				break;
			case "getInvolvedProjectsDone":
				this.setState({projects: payload.data.data});
				break;
			case "addFriendDone":
			case "removeFriendDone":
				OI.getFriends({userID: this.props.user.id});
				break;
			case "joinProjectDone":
			case "leaveProjectDone":
				OI.getInvolvedProjects({userID: this.props.user.id});
				break;
			case "userConnected":
			case "userDisconnected":
				var status = payload.type == "userConnected" ? "Online" : "Offline";
				var users = this.state.users;
				for (var i in users) {
					if (users[i].id == payload.data) {
						users[i].status = status;
					}
				}
				break;
			}
		}.bind(this));

		OI.getFriends({userID: this.props.user.id});
		OI.getInvolvedProjects({userID: this.props.user.id});
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var user = this.props.user;
		var tab = this.state.tab;
		return (
			React.createElement(Window, {className: "friends", style: m(this.styles.container, this.props.showFriendsPanel && this.styles.materialize)}, 
				React.createElement(Window.Header, {onClose: this.toggleFriends}, "Friends"), 
				React.createElement(Window.Content, {style: this.styles.content}, 
					React.createElement(Friends.UserItem, {user: user, activates: "me-dropdown"}), 
					React.createElement(Friends.MeDropdown, null), 
					React.createElement("ul", {style: this.styles.tabContainer}, 
						React.createElement("li", {onClick: this.handleSwitchToUsersTab, style: m(this.styles.tab, tab == "users" && this.styles.tabActive)}, "Users"), 
						React.createElement("li", {onClick: this.handleSwitchToProjectsTab, style: m(this.styles.tab, tab== "projects" && this.styles.tabActive)}, "Projects")
					), 
					React.createElement("div", {style: this.styles.tabContent}, 
						React.createElement(Friends.Users, {user: user, users: this.state.users, style: this.state.tab == "users" && {display: "block"}}), 
						React.createElement(Friends.Projects, {user: user, projects: this.state.projects, style: this.state.tab == "projects" && {display: "block"}})
					)
				), 
				React.createElement(Window.Footer, null
				)
			)
		)
	},
	toggleFriends: function() {
		dispatcher.dispatch({type: "toggleFriendsPanel"});
	},
	handleSwitchToUsersTab: function(e) {
		this.setState({tab: "users"});
	},
	handleSwitchToProjectsTab: function(e) {
		this.setState({tab: "projects"});
	},
});
