var User = React.createClass({displayName: "User",
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
			return React.createElement("div", null)
		}
		return (
			React.createElement("main", {className: "user"}, 
				React.createElement(User.Content, {user: this.props.user, viewedUser: this.state.viewedUser})
			)
		)
	},
});

User.Content = React.createClass({displayName: "Content",
	render: function() {
		var user = this.props.user;
		var viewedUser = this.props.viewedUser;
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement("div", {className: "container"}, 
					React.createElement("div", {className: "col s12 m4 l3"}, 
						React.createElement("div", {className: "card"}, 
							React.createElement("div", {className: "card-content"}, 
								React.createElement(User.Content.AvatarContainer, {viewedUser: viewedUser}), 
								React.createElement(User.Content.ImageCropperModal, {viewedUser: viewedUser})
							), 
							React.createElement("div", {className: "card-action"}, 
								React.createElement(User.Content.Fullname, {viewedUser: viewedUser}), 
								React.createElement(User.Content.Title, {viewedUser: viewedUser}), 
								React.createElement(User.Content.Interests, {user: user, viewedUser: viewedUser})
							), 
							React.createElement("div", {className: "card-action"}, 
							
								viewedUser.isFriend ? React.createElement("button", {className: "btn waves-effect waves-light", onClick: this.handleRemoveFriend}, "Remove Friend") :
												React.createElement("button", {className: "btn waves-effect waves-light", onClick: this.handleAddFriend}, "Add Friend")
							
							)
						)
					), 
					React.createElement("div", {className: "col s12 m9 l8"}, 
						React.createElement(User.Content.Description, {viewedUser: viewedUser})
					), 
					React.createElement("div", {className: "col s12 m9 l8"}, 
						React.createElement(InvolvedProjects, {userID: viewedUser.id})
					)
				)
			)
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

User.Content.AvatarContainer = React.createClass({displayName: "AvatarContainer",
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
			React.createElement("div", {style: this.styles.container, onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave}, 
				React.createElement(User.Content.Avatar, {viewedUser: viewedUser}), 
				React.createElement(User.Content.Overlay, {hovering: this.state.hovering})
			)
		)
	},
	handleMouseEnter: function(e) {
		this.setState({hovering: true});
	},
	handleMouseLeave: function(e) {
		this.setState({hovering: false});
	},
});

User.Content.Avatar = React.createClass({displayName: "Avatar",
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
			React.createElement("div", {style: this.styles.container}, 
				React.createElement("label", {htmlFor: "avatar-input"}, 
					React.createElement("img", {style: this.styles.image, className: "circle", src: viewedUser.avatarURL + "?" + date.getTime()})
				), 
				React.createElement("input", {id: "avatar-input", type: "file", style: this.styles.input, onChange: this.onChange})
			)
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

User.Content.Overlay = React.createClass({displayName: "Overlay",
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
			React.createElement("div", {className: "valign-wrapper", style: m(this.styles.container, this.props.hovering && this.styles.hovering)}, 
				React.createElement("div", {className: "valign", style: {margin: "0 auto"}}, 
					React.createElement("p", {style: this.styles.text}, "Change profile picture")
				)
			)
		)
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
				React.createElement("h5", {ref: "fullname", style: {display: "inline"}, contentEditable: this.state.editMode}, this.props.viewedUser.fullname), 
				
					this.state.hovering || this.state.editMode ?
					React.createElement("i", {className: "material-icons edit-icon", onClick: this.handleClick}, this.state.editMode ? "done" : "edit mode") : ""
				
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
			$(fullname).html(text);
			OI.updateUser({fullname: text});
		}
	},
});

User.Content.Description = React.createClass({displayName: "Description",
	getInitialState: function() {
		return {hovering: false, editMode: false};
	},
	render: function() {
		var viewedUser = this.props.viewedUser;
		var editMode = this.state.editMode;
		return (
			React.createElement("div", {className: "card"}, 
				React.createElement("div", {className: classNames("card-content", editMode && "blue white-text")}, 
					React.createElement("div", {onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave}, 
						React.createElement("h5", {style: {display: "block"}}, 
							"Description", 
						
							this.state.hovering || this.state.editMode ?
							React.createElement("i", {className: "material-icons edit-icon", onClick: this.handleClick}, this.state.editMode ? "done" : "edit mode") : ""
						
						), 
						React.createElement("p", {ref: "description", contentEditable: this.state.editMode}, viewedUser.description)
					)
				)
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

		var description = React.findDOMNode(this.refs.description);
		if (editMode) {
			var text = $(description).text();
			$(description).html(text);
			OI.updateUser({description: text});
		}
	},
});

User.Content.Title = React.createClass({displayName: "Title",
	getInitialState: function() {
		return {hovering: false, editMode: false};
	},
	render: function() {
		var editMode = this.state.editMode;
		return (
			React.createElement("div", {onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave, style: {minWidth: "16px", minHeight: "16px"}}, 
				React.createElement("p", {ref: "title", style: {display: "inline"}, contentEditable: this.state.editMode}, this.props.viewedUser.title), 
				
					this.state.hovering || this.state.editMode ?
					React.createElement("i", {className: "material-icons edit-icon", onClick: this.handleClick}, this.state.editMode ? "done" : "edit mode") : ""
				
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

		var title = React.findDOMNode(this.refs.title);
		if (editMode) {
			var text = $(title).text();
			$(title).html(text);
			OI.updateUser({title: text});
		}
	},
});

User.Content.Interests = React.createClass({displayName: "Interests",
	getInitialState: function() {
		return {hovering: false, editMode: false};
	},
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.interests)).importTags(this.props.user.interests);
	},
	render: function() {
		var viewedUser = this.props.viewedUser;
		var editMode = this.state.editMode;
		return (
			React.createElement("div", {onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave, style: {minWidth: "16px", minHeight: "16px"}}, 
				React.createElement(TagsInput, {ref: "interests", option: {defaultText: "interests", width: "auto", onChange: this.handleOnChange}})
			)
		)
	},
	handleMouseEnter: function(e) {
		this.setState({hovering: true});
	},
	handleMouseLeave: function(e) {
		this.setState({hovering: false});
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
