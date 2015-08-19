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
				<User.Content user={this.props.user} viewedUser={this.state.viewedUser} />
			</main>
		)
	},
});

User.Content = React.createClass({
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
								<User.Content.Interests user={user} viewedUser={viewedUser} />
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
	handleAddFriend: function(e) {
		OI.addFriend({userID: this.props.viewedUser.id});
		e.preventDefault();
	},
	handleRemoveFriend: function(e) {
		OI.removeFriend({userID: this.props.viewedUser.id});
		e.preventDefault();
	},
});

User.Content.AvatarContainer = React.createClass({
	styles: {
		container: {
			position: "relative",
			width: "200px",
			height: "200px",
			margin: "0 auto",
		},
	},
	render: function() {
		var viewedUser = this.props.viewedUser;
		return (
			<div style={this.styles.container}>
				<User.Content.Avatar viewedUser={viewedUser} />
			</div>
		)
	},
});

User.Content.Avatar = React.createClass({
	styles: {
		container: {
			position: "absolute",
			width: "100%",
			height: "100%",
		},
		image: {
			width: "100%",
			height: "100%",
		},
	},
	mixins: [ Navigation ],
	render: function() {
		var viewedUser = this.props.viewedUser;
		return (
			<div style={this.styles.container}>
				<img style={this.styles.image} className="circle" src={viewedUser.avatarURL} />
			</div>
		)
	},
});

User.Content.Fullname = React.createClass({
	render: function() {
		return <h5>{this.props.viewedUser.fullname}</h5>
	},
});

User.Content.Title = React.createClass({
	styles: {
		container: {
			display: "inline",
		},
	},
	render: function() {
		return <p style={this.styles.container}>{this.props.viewedUser.title}</p>
	},
});

User.Content.Interests = React.createClass({
	render: function() {
		var interests = this.props.viewedUser.interests;
		return (
			<TagIt onChange={this.handleOnChange}>{
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

User.Content.Description = React.createClass({
	render: function() {
		var viewedUser = this.props.viewedUser;
		return (
			<div className="card">
				<div className={"card-content"}>
					<div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
						<h5>Description</h5>
						<p>{viewedUser.description}</p>
					</div>
				</div>
			</div>
		)
	},
});
