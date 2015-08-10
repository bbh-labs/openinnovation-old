var Friends = React.createClass({
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
			<Window className="friends" style={m(this.styles.container, this.props.showFriendsPanel && this.styles.materialize)}>
				<Window.Header onClose={this.toggleFriends}>Friends</Window.Header>
				<Window.Content style={this.styles.content}>
					<Friends.UserItem user={user} activates="me-dropdown" />
					<Friends.MeDropdown />
					<ul style={this.styles.tabContainer}>
						<li onClick={this.handleSwitchToUsersTab} style={m(this.styles.tab, tab == "users" && this.styles.tabActive)}>Users</li>
						<li onClick={this.handleSwitchToProjectsTab} style={m(this.styles.tab, tab== "projects" && this.styles.tabActive)}>Projects</li>
					</ul>
					<div style={this.styles.tabContent}>
						<Friends.Users user={user} users={this.state.users} style={this.state.tab == "users" && {display: "block"}}/>
						<Friends.Projects user={user} projects={this.state.projects} style={this.state.tab == "projects" && {display: "block"}}/>
					</div>
				</Window.Content>
				<Window.Footer>
				</Window.Footer>
			</Window>
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
