var User = React.createClass({displayName: "User",
	mixins: [ State ],
	render: function() {
		return (
			React.createElement("main", {className: "user"}, 
				React.createElement(User.Content, {user: this.props.user, userID: this.getParams().userID})
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
								React.createElement("img", {className: "profile-picture circle", src: "images/profile-pics/1.jpg"})
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
							React.createElement(InvolvedProjects, {userID: this.props.userID})
						)
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
