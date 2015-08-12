Project.Members = React.createClass({displayName: "Members",
	render: function() {
		var members = this.props.project.members;
		return (
			React.createElement("div", {id: "project-members", className: "col s12"}, 
				React.createElement("div", {className: "main col s12"}, 
					React.createElement("ul", {className: "collection col s12"}, 
						members ?
						members.map(function(m) {
							return React.createElement(Project.Members.Item, {key: m.id, member: m})
						}) : ""
					)
				)
			)
		)
	},
});

Project.Members.Item = React.createClass({displayName: "Item",
	render: function() {
		var member = this.props.member;
		return (
			React.createElement("li", {className: "collection-item avatar"}, 
				React.createElement(Link, {to: "user", params: {userID: member.id}}, 
					React.createElement("img", {className: "circle", src: member.avatarURL}), 
					React.createElement("span", {className: "title", style: {display: "block"}}, React.createElement("strong", null, member.fullname)), 
					React.createElement("p", null, member.title)
				)
			)
		)
	},
	handleChat: function(e) {
		dispatcher.dispatch({
			type: "openChatModal",
			data: {
				data: this.props.member,
				type: "user",
			},
		});

		e.preventDefault();
	},
});
