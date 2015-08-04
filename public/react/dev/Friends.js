var Friends = React.createClass({
	render: function() {
		return <div/>
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
