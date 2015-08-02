var User = React.createClass({displayName: "User",
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
			return React.createElement("div", null)
		}
		return (
			React.createElement("main", {className: "user"}, 
				React.createElement(User.Content, {user: this.state.user})
			)
		)
	},
});

User.Content = React.createClass({displayName: "Content",
	render: function() {
		var user = this.props.user;
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement("div", {className: "container"}, 
					React.createElement("div", {className: "col s12 m4 l3"}, 
						React.createElement("div", {className: "card"}, 
							React.createElement("div", {className: "card-content"}, 
								React.createElement(User.Content.Avatar, {user: user}), 
								React.createElement(User.Content.ImageCropperModal, {user: user})
							), 
							React.createElement("div", {className: "card-action"}, 
								React.createElement(User.Content.Fullname, {user: user}), 
								React.createElement("p", null, user.title)
							), 
							React.createElement("div", {className: "card-action"}, 
								React.createElement("a", {href: "#"}, React.createElement("i", {className: "material-icons"}, "message"))
							)
						)
					), 
						React.createElement("div", {className: "col s12 m9 l8"}, 
							React.createElement("div", {className: "card"}, 
								React.createElement("div", {className: "card-content"}, 
									React.createElement("h5", null, "Description"), 
									React.createElement("p", null, user.description)
								)
							)
						), 
						React.createElement("div", {className: "col s12 m9 l8"}, 
							React.createElement(InvolvedProjects, {userID: user.id})
						)
				)
			)
		)
	},
});

User.Content.Avatar = React.createClass({displayName: "Avatar",
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
			case "newProjectDone":
				this.transitionTo("project", {projectID: payload.data.data});
				break;
			case "newProjectFail":
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
		return React.createElement("img", {className: "profile-picture circle", src: user.avatarURL + "?" + date.getTime()})
	},
});

User.Content.Fullname = React.createClass({displayName: "Fullname",
	getInitialState: function() {
		return {hovering: false, editMode: false};
	},
	render: function() {
		var editMode = this.state.editMode;
		return (
			React.createElement("div", {onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave}, 
				React.createElement("h5", {ref: "fullname", style: {display: "inline"}, contentEditable: this.state.editMode}, this.props.user.fullname), " ", this.editElement()
			)
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
			OI.updateUser({fullname: text});
			$(fullname).html(text);
		}
	},
	editElement: function() {
		if (this.state.hovering || this.state.editMode) {
			return React.createElement("i", {className: "material-icons edit-icon", onClick: this.handleClick}, this.state.editMode ? "done" : "edit mode")
		}
	},
});

User.Content.Description = React.createClass({displayName: "Description",
	getInitialState: function() {
		return {hovering: false, editMode: false};
	},
	render: function() {
		var editMode = this.state.editMode;
		return (
			React.createElement("div", {onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave}, 
				React.createElement("h5", {ref: "fullname", style: {display: "inline"}, contentEditable: this.state.editMode}, this.props.user.fullname), " ", this.editElement()
			)
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
			OI.updateUser({fullname: text});
			$(fullname).html(text);
		}
	},
	editElement: function() {
		if (this.state.hovering || this.state.editMode) {
			return React.createElement("i", {className: "material-icons edit-icon", onClick: this.handleClick}, this.state.editMode ? "done" : "edit mode")
		}
	},
});
