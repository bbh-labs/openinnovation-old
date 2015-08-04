var ChatOverlay = React.createClass({
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
	render: function() {
		var user = this.props.user;
		return (
			<div className="no-pointer-events" style={this.styles.container}>
				<ChatOverlay.Box user={user} showFriendsPanel={this.props.showFriendsPanel} />
				<ChatOverlay.Actions showFriendsPanel={this.props.showFriendsPanel} />
			</div>
		)
	},
});

ChatOverlay.Box = React.createClass({
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
			<div className="friends-panel z-depth-2 has-pointer-events" style={{visibility: this.props.showFriendsPanel ? "visible" : "hidden"}}>
				<div className="friends-header materialize-red">
					<div className="left">
						Friends
					</div>
					<div className="right">
						<a href="#" onClick={this.togglePanel}><i className="material-icons">close</i></a>
					</div>
				</div>
				<div className="friends-myprofile">
					<Friends.List.Item user={user} />
				</div>
				<Friends.List user={user} />
			</div>
		)
	},
	togglePanel: function(e) {
		dispatcher.dispatch({type: "toggleFriendsPanel"});

		e.preventDefault();
	},
});

ChatOverlay.Actions = React.createClass({
	styles: {
		container: {
			bottom: "64px",
			right: "64px",
			visibility: "visible",
		},
	},
	render: function() {
		return (
			<div className="fixed-action-btn has-pointer-events" style={m(this.styles.container, this.props.showFriendsPanel && {visibility: "hidden"})}>
				<a href="#" className="btn-floating btn-large red" onClick={this.handleClick}>
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
