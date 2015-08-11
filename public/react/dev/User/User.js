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
			case "updateUserAvatarDone":
				OI.user({userID: this.getParams().userID});
				break;
			case "addFriendDone":
			case "removeFriendDone":
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
								<User.Content.ImageCropperModal viewedUser={viewedUser} />
							</div>
							<div className="card-action">
								<User.Content.Fullname user={user} viewedUser={viewedUser} />
								<User.Content.Title user={user} viewedUser={viewedUser} />
								<User.Content.Interests user={user} viewedUser={viewedUser} />
							</div>
							<div className="card-action">
							{
								viewedUser.isFriend ? <button className="btn waves-effect waves-light" onClick={this.handleRemoveFriend}>Remove Friend</button> :
												<button className="btn waves-effect waves-light" onClick={this.handleAddFriend}>Add Friend</button>
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
	getInitialState: function() {
		return {hovering: false};
	},
	render: function() {
		var viewedUser = this.props.viewedUser;
		return (
			<div style={this.styles.container} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<User.Content.Avatar viewedUser={viewedUser} />
				<User.Content.Overlay hovering={this.state.hovering} />
			</div>
		)
	},
	handleMouseEnter: function(e) {
		this.setState({hovering: true});
	},
	handleMouseLeave: function(e) {
		this.setState({hovering: false});
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
		input: {
			display: "none",
		},
	},
	mixins: [ Navigation ],
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "createProjectDone":
				this.transitionTo("project", {projectID: payload.data.data});
				break;
			case "createProjectFail":
				switch (payload.data.status) {
				default:
					Materialize.toast(payload.data.responseText, 3000, "red white-text");
					break;
				case 500:
					Materialize.toast("Something went wrong when creating the new project..", 3000, "red white-text");
					break;
				}
				break;
			}
		}.bind(this));
	},
	render: function() {
		var viewedUser = this.props.viewedUser;
		var date = new Date();
		return (
			<div style={this.styles.container}>
				<label htmlFor="avatar-input">
					<img style={this.styles.image} className="circle" src={viewedUser.avatarURL + "?tmp=" + date.getTime()} />
				</label>
				<input id="avatar-input" type="file" style={this.styles.input} onChange={this.onChange} />
			</div>
		)
	},
	onChange: function(e) {
		var reader = new FileReader();

		reader.onload = function(e) {
			dispatcher.dispatch({
				type: "openUserImageCropper",
				data: e.target.result,
			});
		}.bind(this);

		reader.readAsDataURL(e.target.files[0]);
	},
});

User.Content.Overlay = React.createClass({
	styles: {
		container: {
			position: "absolute",
			width: "100%",
			height: "100%",
			borderRadius: "50%",
			background: "black",
			transition: "opacity .2s",
			pointerEvents: "none",
			opacity: 0,
		},
		hovering: {
			opacity: 0.5,
		},
		text: {
			color: "white"
		},
	},
	render: function() {
		return (
			<div className="valign-wrapper" style={m(this.styles.container, this.props.hovering && this.styles.hovering)}>
				<div className="valign" style={{margin: "0 auto"}}>
					<p style={this.styles.text}>Change profile picture</p>
				</div>
			</div>
		)
	},
});

User.Content.Fullname = React.createClass({
	componentDidMount: function() {
		if (this.props.user.id != this.props.viewedUser.id) {
			return;
		}

		var fullname = React.findDOMNode(this);
		$(fullname).editable({
			url: "/api/user",
			send: "always",
			params: function(params) {
				params.fullname = params.value;
				return params;
			},
			success: function(resp) {
				dispatcher.dispatch({type: "updateUserDone"});
			},
		});
	},
	render: function() {
		return (
			<h5>{this.props.viewedUser.fullname}</h5>
		)
	},
});

User.Content.Title = React.createClass({
	styles: {
		container: {
			display: "inline",
		},
	},
	componentDidMount: function() {
		if (this.props.user.id != this.props.viewedUser.id) {
			return;
		}

		var title = React.findDOMNode(this);
		$(title).editable({
			url: "/api/user",
			send: "always",
			params: function(params) {
				params.title = params.value;
				return params;
			},
			success: function(resp) {
				dispatcher.dispatch({type: "updateUserDone"});
			},
		});
	},
	render: function() {
		return (
			<p style={this.styles.container}>{this.props.viewedUser.title}</p>
		)
	},
});

User.Content.Interests = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.interests)).importTags(this.props.user.interests);
	},
	render: function() {
		var viewedUser = this.props.viewedUser;
		return <TagsInput ref="interests" option={{defaultText: "interests", width: "auto", onChange: this.handleOnChange}} />
	},
	handleOnChange: function(e) {
		var user = this.props.user;
		var viewedUser = this.props.viewedUser;
		if (viewedUser.id != user.id) {
			return;
		}
	
		var interests = React.findDOMNode(this.refs.interests);
		var text = $(interests).val();
		OI.updateUser({interests: text});
	},
});

User.Content.Description = React.createClass({
	getInitialState: function() {
		return {hovering: false, editMode: false};
	},
	render: function() {
		var viewedUser = this.props.viewedUser;
		var editMode = this.state.editMode;
		return (
			<div className="card">
				<div className={classNames("card-content", editMode && "blue white-text")}>
					<div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
						<h5 style={{display: "block"}}>
							Description
						{
							this.state.hovering || this.state.editMode ?
							<i className="material-icons edit-icon" onClick={this.handleClick}>{this.state.editMode ? "done" : "edit mode"}</i> : ""
						}
						</h5>
						<p ref="description" contentEditable={this.state.editMode}>{viewedUser.description}</p>
					</div>
				</div>
			</div>
		)
	},
	handleMouseEnter: function(e) {
		this.setState({hovering: true});
	},
	handleMouseLeave: function(e) {
		this.setState({hovering: false});
	},
	handleClick: function(e) {
		var editMode = this.state.editMode;
		this.setState({editMode: !editMode});

		var description = React.findDOMNode(this.refs.description);
		if (editMode) {
			var text = $(description).text();
			$(description).html(text);
			OI.updateUser({description: text});
		}
	},
});
