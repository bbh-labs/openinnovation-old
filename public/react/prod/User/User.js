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
								React.createElement(User.Content.AvatarContainer, {viewedUser: viewedUser})
							), 
							React.createElement("div", {className: "card-action"}, 
								React.createElement(User.Content.Fullname, {user: user, viewedUser: viewedUser}), 
								React.createElement(User.Content.Title, {user: user, viewedUser: viewedUser}), 
								React.createElement(User.Content.Interests, {user: user, viewedUser: viewedUser})
							), 
							React.createElement("div", {className: "card-action"}, 
							
								viewedUser.isFriend ?
								React.createElement("button", {className: "btn waves-effect waves-light", onClick: this.handleRemoveFriend}, "Remove Friend") : React.createElement("button", {className: "btn waves-effect waves-light", onClick: this.handleAddFriend}, "Add Friend")
							
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
	render: function() {
		var viewedUser = this.props.viewedUser;
		return (
			React.createElement("div", {style: this.styles.container}, 
				React.createElement(User.Content.Avatar, {viewedUser: viewedUser})
			)
		)
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
	},
	mixins: [ Navigation ],
	render: function() {
		var viewedUser = this.props.viewedUser;
		return (
			React.createElement("div", {style: this.styles.container}, 
				React.createElement("img", {style: this.styles.image, className: "circle", src: viewedUser.avatarURL})
			)
		)
	},
});

User.Content.Fullname = React.createClass({displayName: "Fullname",
	render: function() {
		return (
			React.createElement("h5", null, this.props.viewedUser.fullname)
		)
	},
});

User.Content.Title = React.createClass({displayName: "Title",
	styles: {
		container: {
			display: "inline",
		},
	},
	render: function() {
		return (
			React.createElement("p", {style: this.styles.container}, this.props.viewedUser.title)
		)
	},
});

User.Content.Interests = React.createClass({displayName: "Interests",
	render: function() {
		var interests = this.props.viewedUser.interests;
		return (
			React.createElement(TagIt, {onChange: this.handleOnChange}, 
				interests ? interests.map(function(interest) {
					return React.createElement("li", null, interest)
				}) : ""
			)
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

User.Content.Description = React.createClass({displayName: "Description",
	render: function() {
		var viewedUser = this.props.viewedUser;
		return (
			React.createElement("div", {className: "card"}, 
				React.createElement("div", {className: "card-content"}, 
					React.createElement("div", {onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave}, 
						React.createElement("h5", null, "Description"), 
						React.createElement("p", null, viewedUser.description)
					)
				)
			)
		)
	},
});
