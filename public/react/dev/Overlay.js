var Overlay = React.createClass({
	windowID: 0,
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
	getInitialState: function() {
		return {showFriendsPanel: true, windows: [], windowIndex: 0};
	},
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "openUserChat":
				this.openUserChat(payload.data);
				break;
			case "closeUserChat":
				this.closeUserChat(payload.data);
				break;
			case "openProjectChat":
				this.openProjectChat(payload.data);
				break;
			case "closeProjectChat":
				this.closeProjectChat(payload.data);
				break;
			case "toggleFriendsPanel":
				this.setState({showFriendsPanel: !this.state.showFriendsPanel});
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var user = this.props.user;
		var friends = this.props.friends;
		return (
			<div className="no-pointer-events" style={this.styles.container}>
				{
					this.state.windows.length > 0 ?
					this.state.windows.map(function(win) {
						if (win.user) {
							return <Friends.UserChat key={win.id} windowID={win.id} user={user} otherUser={win.user} playChatSound={this.props.playChatSound} />
						} else if (win.project) {
							return <Friends.ProjectChat key={win.id} windowID={win.id} user={user} project={win.project} playChatSound={this.props.playChatSound} />
						}
					}.bind(this)) : ""
				}
				<Friends user={user} friends={friends} showFriendsPanel={this.state.showFriendsPanel} />
				<Overlay.Actions showFriendsPanel={this.state.showFriendsPanel} />
			</div>
		)
	},
	openUserChat: function(user) {
		var windows = this.state.windows;

		windows.push({id: this.windowID, user: user});
		this.windowID++;

		this.setState({windows: windows});
	},
	closeUserChat: function(windowID) {
		var windows = this.state.windows;

		for (var i = 0; i < windows.length; i++) {
			if (windows[i].id == windowID) {
				windows.splice(i);
				this.setState({windows: windows});
				break;
			}
		}
	},
	openProjectChat: function(project) {
		var windows = this.state.windows;

		windows.push({id: this.windowID, project: project});
		this.windowID++;

		this.setState({windows: windows});
	},
	closeProjectChat: function(windowID) {
		var windows = this.state.windows;

		for (var i = 0; i < windows.length; i++) {
			if (windows[i].id == windowID) {
				windows.splice(i);
				this.setState({windows: windows});
				break;
			}
		}
	},
});

Overlay.Actions = React.createClass({
	styles: {
		container: {
			bottom: "64px",
			right: "64px",
			transform: "scale(1)",
		},
		vanish: {
			transform: "scale(0)",
		},
	},
	componentDidMount: function() {
		$(React.findDOMNode(this)).draggable();
	},
	render: function() {
		return (
			<div className="fixed-action-btn has-pointer-events" style={this.styles.container}>
				<a href="#" className="btn-floating btn-large red" style={m(this.props.showFriendsPanel && this.styles.vanish)} onClick={this.handleClick}>
					<i className="large material-icons">chat</i>
				</a>
			</div>
		)
	},
	handleClick: function(e) {
		dispatcher.dispatch({type: "toggleFriendsPanel"});

		e.preventDefault()
	},
});
