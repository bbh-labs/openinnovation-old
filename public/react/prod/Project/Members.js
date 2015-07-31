Project.Members = React.createClass({displayName: "Members",
	getInitialState: function() {
		return {titles: []};
	},
	componentDidMount: function() {
		$.ajax({
			url: "/titles.json",
			method: "GET",
			dataType: "json",
		}).done(function(resp) {
			this.setState({titles: resp});
		}.bind(this)).fail(function(resp) {
			console.log(resp.responseText);
		});

		$(React.findDOMNode(this.refs.modalTrigger)).leanModal({
			dismissable: true,
		});
	},
	render: function() {
		return (
			React.createElement("div", {id: "project-members", className: "col s12"}, 
				React.createElement("div", {className: "main col l9"}, 
					React.createElement("div", {className: "input-field col s12 m4"}, 
						React.createElement("input", {id: "task-search", type: "text", required: true}), 
						React.createElement("label", {htmlFor: "task-search"}, "Search")
					), 
					React.createElement("div", {className: "input-field col s12 m4"}, 
						React.createElement("select", {className: "browser-default", defaultValue: ""}, 
							React.createElement("option", {value: ""}, "Any type"), 
							this.titleElements()
						)
					), 
					React.createElement("ul", {className: "collection col s12"}, 
						this.memberElements()
					)
				), 
				React.createElement("div", {className: "sidebar col s12 m4 l3"}, 
					React.createElement("div", {className: "card small"}, 
						React.createElement("div", {className: "card-image"}, 
							React.createElement("h5", {className: "card-title"}, "Members size")
						), 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("h1", null, "9"), 
							React.createElement("p", null, "people")
						)
					)
				)
			)
		)
	},
	memberElements: function() {
		return buildElements(this.props.project.members, function(i, m) {
			return React.createElement(Project.Members.Item, {key: m.id, member: m})
		});
	},
	titleElements: function() {
		return buildElements(this.state.titles, function(i, p) {
			return React.createElement("option", {key: p, value: p}, p)
		});
	},
});

Project.Members.Item = React.createClass({displayName: "Item",
	render: function() {
		var member = this.props.member;
		return (
			React.createElement("li", {className: "collection-item avatar"}, 
				React.createElement("img", {className: "circle", src: "images/profile-pics/1.jpg"}), 
				React.createElement("span", {className: "title"}, React.createElement("strong", null, member.fullname)), 
				React.createElement("p", null, member.title), 
				React.createElement(Link, {to: "user", params: {userID: member.id}, className: "secondary-content"}, 
					React.createElement("i", {className: "material-icons"}, "send")
				)
			)
		)
	},
});
