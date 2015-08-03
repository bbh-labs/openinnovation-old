var User = React.createClass({
	mixins: [ State ],
	getInitialState: function() {
		return {user: null};
	},
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "userDone":
				this.setState({user: payload.data.data});
				break;
			case "userFail":
				Materialize.toast("Failed to get user", 1000, "red white-text");
				break;
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
		if (!this.state.user) {
			return <div />
		}
		return (
			<main className="user">
				<User.Content user={this.state.user} />
			</main>
		)
	},
});

User.Content = React.createClass({
	render: function() {
		var user = this.props.user;
		return (
			<div className="row">
				<div className="container">
					<div className="col s12 m4 l3">
						<div className="card">
							<div className="card-content">
								<User.Content.Avatar user={user} />
								<User.Content.ImageCropperModal user={user} />
							</div>
							<div className="card-action">
								<User.Content.Fullname user={user} />
								<User.Content.Title user={user} />
							</div>
							<div className="card-action">
								<a href="#"><i className="material-icons">message</i></a>
							</div>
						</div>
					</div>
						<div className="col s12 m9 l8">
							<div className="card">
								<div className="card-content">
									<User.Content.Description user={user} />
								</div>
							</div>
						</div>
						<div className="col s12 m9 l8">
							<InvolvedProjects userID={user.id} />
						</div>
				</div>
			</div>
		)
	},
});

User.Content.Avatar = React.createClass({
	componentDidMount: function() {
		var dropzone = React.findDOMNode(this);
		$(dropzone).dropzone({
            url: "/foo",
            clickable: true,
            maxFilesize: 1,
            autoProcessQueue: false,
            dictDefaultMessage: "Select your avatar (max: 1MB)",
            addedfile: function(file) {
                var reader = new FileReader();
                reader.onload = function(e) {
					dispatcher.dispatch({
						type: "openUserImageCropper",
						data: e.target.result,
					});
                }.bind(this);
                reader.readAsDataURL(file);
            }.bind(this),
		});

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
		var user = this.props.user;
		var date = new Date();
		return <img className="profile-picture circle" src={user.avatarURL + "?" + date.getTime()} />
	},
});

User.Content.Fullname = React.createClass({
	getInitialState: function() {
		return {hovering: false, editMode: false};
	},
	render: function() {
		var editMode = this.state.editMode;
		return (
			<div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<h5 ref="fullname" style={{display: "inline"}} contentEditable={this.state.editMode}>{this.props.user.fullname}</h5>
				{
					this.state.hovering || this.state.editMode ?
					<i className="material-icons edit-icon" onClick={this.handleClick}>{this.state.editMode ? "done" : "edit mode"}</i> : ""
				}
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

		var fullname = React.findDOMNode(this.refs.fullname);
		if (editMode) {
			var text = $(fullname).text();
			$(fullname).html(text);
			OI.updateUser({fullname: text});
		}
	},
});

User.Content.Description = React.createClass({
	getInitialState: function() {
		return {hovering: false, editMode: false};
	},
	render: function() {
		var user = this.props.user;
		var editMode = this.state.editMode;
		return (
			<div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<h5 style={{display: "block"}}>
					Description
				{
					this.state.hovering || this.state.editMode ?
					<i className="material-icons edit-icon" onClick={this.handleClick}>{this.state.editMode ? "done" : "edit mode"}</i> : ""
				}
				</h5>
				<p ref="description" contentEditable={this.state.editMode}>{user.description}</p>
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

User.Content.Title = React.createClass({
	getInitialState: function() {
		return {hovering: false, editMode: false};
	},
	render: function() {
		var editMode = this.state.editMode;
		return (
			<div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} style={{minWidth: "16px", minHeight: "16px"}}>
				<p ref="title" style={{display: "inline"}} contentEditable={this.state.editMode}>{this.props.user.title}</p>
				{
					this.state.hovering || this.state.editMode ?
					<i className="material-icons edit-icon" onClick={this.handleClick}>{this.state.editMode ? "done" : "edit mode"}</i> : ""
				}
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

		var title = React.findDOMNode(this.refs.title);
		if (editMode) {
			var text = $(title).text();
			$(title).html(text);
			OI.updateUser({title: text});
		}
	},
});
