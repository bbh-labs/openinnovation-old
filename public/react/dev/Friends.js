var Friends = React.createClass({
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

Friends.List = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this)).scrollbar();
	},
	render: function() {
		var user = this.props.user;
		return (
			<div className="friends-list">
				<Friends.List.Item user={user} />
				<Friends.List.Item user={user} />
				<Friends.List.Item user={user} />
				<Friends.List.Item user={user} />
				<Friends.List.Item user={user} />
				<Friends.List.Item user={user} />
				<Friends.List.Item user={user} />
				<Friends.List.Item user={user} />
			</div>
		)
	},
});

Friends.List.Item = React.createClass({
	render: function() {
		var user = this.props.user;
		return (
			<div className="item">
				<img src={user.avatarURL} className="friends-avatar" />
				<p className="friends-status">
					{user.fullname}<br/>
					Online
				</p>
			</div>
		)
	},
});
