Project.Overview = React.createClass({displayName: "Overview",
	getInitialState: function() {
		return {editMode: false};
	},
	render: function() {
		var user = this.props.user;
		var project = this.props.project;
		var editMode = this.state.editMode;
		return (
			React.createElement("div", {id: "project-overview", className: "col s12"}, 
				React.createElement("div", {className: "main col s12 m8 l9"}, 
					React.createElement("div", {className: classNames("card", editMode && "blue white-text")}, 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("h5", null, "Description", 
								React.createElement("a", {href: "#", onClick: this.handleClick}, 
									React.createElement("i", {className: classNames("material-icons right", editMode && "white-text")}, 
										editMode ? "done" : "mode edit"
									)
								)
							), 
							this.descriptionElement()
						)
					)
				), 
				React.createElement("div", {className: "sidebar col s12 m4 l3"}, 
					React.createElement("div", {className: "card small"}, 
						React.createElement("div", {className: "card-image"}, 
							React.createElement("h5", {className: "card-title"}, "Team Size")
						), 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("h1", null, project.members.length), 
							React.createElement("p", null, project.members.length <= 1 ? "person" : "people")
						)
					), 
					
						user.id == project.authorID ?
						React.createElement(Link, {className: "btn waves-effect waves-light col s12", to: "edit-project", params: {projectID: project.id}}, "Edit Project") : ""
					
				)
			)
		)
	},
	handleClick: function(e) {
		var editMode = this.state.editMode;
		if (editMode) {
			var description = React.findDOMNode(this.refs.description).innerHTML;
			OI.updateProject({
				projectID: this.props.project.id,
				description: description,
			});
		}
		this.setState({editMode: !editMode});
	
		e.preventDefault();
	},
	descriptionElement: function() {
		if (this.state.editMode) {
			return React.createElement("p", {className: "no-outline", ref: "description", contentEditable: true}, this.props.project.description)
		}
		return React.createElement("p", {ref: "description"}, this.props.project.description)
	},
});
