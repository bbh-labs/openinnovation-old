var User = React.createClass({
	mixins: [ State ],
	getInitialState: function() {
		return {viewedUser: null};
	},
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "userDone":
				this.setState({viewedUser: payload.data.data});
				break;
			case "userFail":
				Materialize.toast("Failed to get user", 1000, "red white-text");
				break;
			case "addFriendDone":
			case "removeFriendDone":
			case "updateUserAvatarDone":
				OI.user({userID: this.getParams().userID});
				break;
			}
		}.bind(this));

		OI.user({userID: this.getParams().userID});
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		if (!this.state.viewedUser) {
			return <div />
		}
		return (
			<main className="user">
				<h5 style={Styles.PageTitle}>User</h5>
				<User.Header user={this.props.user} viewedUser={this.state.viewedUser} />
				<User.Content user={this.props.user} viewedUser={this.state.viewedUser} />
			</main>
		)
	},
});

User.Header = React.createClass({
	styles: {
		container: {
			background: "#202020",
			minHeight: "250px",
			textAlign: "center",
			padding: "50px",
		},
		avatar: {
			width: "100px",
			height: "100px",
		},
		text: {
			width: "50%",
			margin: "16px auto",
		},
	},
	render: function() {
		var user = this.props.user;
		var viewedUser = this.props.viewedUser;
		return (
			<div style={this.styles.container}>
				<img className="circle" src={viewedUser.avatarURL} style={this.styles.avatar} />
				<h5 className="white-text">{viewedUser.fullname}</h5>
				<p className="flow-text white-text">{viewedUser.title}</p>
				<p className="white-text" style={this.styles.text}>{viewedUser.description}</p>
				<User.Header.Interests user={user} viewedUser={viewedUser} />
				{
					viewedUser.isFriend ?
					<button className="btn waves-effect waves-light red white-text margin-top" onClick={this.handleRemoveFriend}>Remove Friend</button> :
					<button className="btn waves-effect waves-light blue white-text margin-top" onClick={this.handleAddFriend}>Add Friend</button>
				}
			</div>
		)
	},
	handleAddFriend: function(e) {
		OI.addFriend({userID: this.props.viewedUser.id});
		e.preventDefault();
	},
	handleRemoveFriend: function(e) {
		OI.removeFriend({userID: this.props.viewedUser.id});
		e.preventDefault();
	},
});

User.Header.Interests = React.createClass({
	styles: {
		container: {
			width: "50%",
			margin: "0 auto",
		},
	},
	render: function() {
		var interests = this.props.viewedUser.interests;
		return (
			<TagIt style={this.styles.container} onChange={this.handleOnChange}>{
				interests ? interests.map(function(interest) {
					return <li>{interest}</li>
				}) : ""
			}</TagIt>
		)
	},
	handleOnChange: function(e, ui) {
		var user = this.props.user;
		var viewedUser = this.props.viewedUser;
		if (viewedUser.id != user.id) {
			return;
		}

		var interests = $(e.target).tagit("assignedTags").join(",");
		OI.updateUser({interests: interests});
	},
});

User.Content = React.createClass({
	render: function() {
		var user = this.props.user;
		var viewedUser = this.props.viewedUser;
		return (
			<div className="container">
				<div className="col s12">
					<InvolvedProjects userID={viewedUser.id} />
				</div>
			</div>
		)
	},
});

User.Content2 = React.createClass({
	render: function() {
		var user = this.props.user;
		var viewedUser = this.props.viewedUser;
		return (
			<div className="row">
				<div className="container">
					<div className="col s12 m4 l3">
						<div className="card">
							<div className="card-content">
								<User.Content.AvatarContainer viewedUser={viewedUser} />
							</div>
							<div className="card-action">
								<User.Content.Fullname user={user} viewedUser={viewedUser} />
								<User.Content.Title user={user} viewedUser={viewedUser} />
							</div>
							<div className="card-action">
							{
								viewedUser.isFriend ?
								<button className="btn waves-effect waves-light" onClick={this.handleRemoveFriend}>Remove Friend</button> : <button className="btn waves-effect waves-light" onClick={this.handleAddFriend}>Add Friend</button>
							}
							</div>
						</div>
					</div>
					<div className="col s12 m9 l8">
						<User.Content.Description viewedUser={viewedUser} />
					</div>
					<div className="col s12 m9 l8">
						<InvolvedProjects userID={viewedUser.id} />
					</div>
				</div>
			</div>
		)
	},
});
