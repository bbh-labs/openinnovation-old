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
				React.createElement("h5", {style: Styles.PageTitle}, "User"), 
				React.createElement(User.Header, {user: this.props.user, viewedUser: this.state.viewedUser}), 
				React.createElement(User.Content, {user: this.props.user, viewedUser: this.state.viewedUser})
			)
		)
	},
});

User.Header = React.createClass({displayName: "Header",
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
			React.createElement("div", {style: this.styles.container}, 
				React.createElement("img", {className: "circle", src: viewedUser.avatarURL, style: this.styles.avatar}), 
				React.createElement("h5", {className: "white-text"}, viewedUser.fullname), 
				React.createElement("p", {className: "flow-text white-text"}, viewedUser.title), 
				React.createElement("p", {className: "white-text", style: this.styles.text}, viewedUser.description), 
				React.createElement(User.Header.Interests, {user: user, viewedUser: viewedUser}), 
				
					viewedUser.isFriend ?
					React.createElement("button", {className: "btn waves-effect waves-light red white-text margin-top", onClick: this.handleRemoveFriend}, "Remove Friend") :
					React.createElement("button", {className: "btn waves-effect waves-light blue white-text margin-top", onClick: this.handleAddFriend}, "Add Friend")
				
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

User.Header.Interests = React.createClass({displayName: "Interests",
	styles: {
		container: {
			width: "50%",
			margin: "0 auto",
		},
	},
	render: function() {
		var interests = this.props.viewedUser.interests;
		return (
			React.createElement(TagIt, {style: this.styles.container, onChange: this.handleOnChange}, 
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

User.Content = React.createClass({displayName: "Content",
	render: function() {
		var user = this.props.user;
		var viewedUser = this.props.viewedUser;
		return (
			React.createElement("div", {className: "container"}, 
				React.createElement("div", {className: "col s12"}, 
					React.createElement(InvolvedProjects, {userID: viewedUser.id})
				)
			)
		)
	},
});

User.Content2 = React.createClass({displayName: "Content2",
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
								React.createElement(User.Content.Title, {user: user, viewedUser: viewedUser})
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
});
