var EditProject = React.createClass({displayName: "EditProject",
	mixins: [ Navigation, State ],
	getInitialState: function() {
		return {project: null};
	},
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "projectDone":
				this.setState({project: payload.data.data});
				break;
			case "projectFail":
				this.transitionTo("dashboard");
				break;
			}
		}.bind(this));

		OI.project({projectID: this.getParams().projectID});
	},
	render: function() {
		var project = this.state.project;
		if (!this.state.project) {
			return React.createElement("div", null)
		}
		return (
			React.createElement("main", {className: "edit-project"}, 
				React.createElement(EditProject.Cover, null), 
				React.createElement(EditProject.Form, {project: project})
			)
		)
	},
});

EditProject.Cover = React.createClass({displayName: "Cover",
	mixins: [ Navigation ],
	componentDidMount: function() {
		var dropzone = React.findDOMNode(this);
		$(dropzone).dropzone({
            url: "/foo",
            clickable: true,
            maxFilesize: 1,
            autoProcessQueue: false,
            dictDefaultMessage: "Select your project cover (max: 1MB)",
            addedfile: function(file) {
                var reader = new FileReader();
                reader.onload = function(e) {
					dispatcher.dispatch({
						type: "edit-project-image-file",
						file: file,
					});
                    dropzone.style.background = "url(" + e.target.result + ") center / cover";
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
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		return (
			React.createElement("div", {className: "parallax-container"}, 
				React.createElement("div", {ref: "parallax", className: "parallax"}, 
					React.createElement("img", {src: "images/1.jpg"})
				), 
				React.createElement("div", {className: "parallax-overlay valign-wrapper"}, 
					React.createElement("div", {className: "valign"}, 
						React.createElement("h1", null, "Upload a representative image"), 
						React.createElement("h4", null, "It can be changed at later time")
					)
				)
			)
		)
	},
});

EditProject.Form = React.createClass({displayName: "Form",
	image: null,
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "edit-project-image-file":
				this.image = payload.file;
				break;
			case "updateProjectDone":
				Materialize.toast("Successfully updated the project", 1000);
				break;
			case "updateProjectFail":
				Materialize.toast("Failed to update the project", 1000);
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
		this.image = null;
	},
	render: function() {
		var project = this.props.project;
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement("div", {className: "container"}, 
					React.createElement("form", {className: "col s8 offset-s2", onSubmit: this.handleSubmit}, 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "input-field col s12"}, 
								React.createElement("input", {type: "text", name: "title", id: "project-title", className: "validate", defaultValue: project.title}), 
								React.createElement("label", {htmlFor: "project-title", className: "active"}, "Name")
							)
						), 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "input-field col s12"}, 
								React.createElement("input", {type: "text", name: "tagline", id: "project-tagline", className: "validate", defaultValue: project.tagline}), 
								React.createElement("label", {htmlFor: "project-tagline", className: "active"}, "Tagline")
							)
						), 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "input-field col s12"}, 
								React.createElement("textarea", {id: "project-description", name: "description", className: "materialize-textarea", defaultValue: project.description}), 
								React.createElement("label", {htmlFor: "project-description", className: "active"}, "Description")
							)
						), 
						React.createElement("input", {type: "hidden", name: "projectID", value: project.id}), 
						React.createElement("button", {className: "waves-effect waves-light btn", type: "submit"}, "Update"), 
						React.createElement(Link, {className: "btn waves-effect waves-light grey", to: "project", params: {projectID: project.id}}, "View")
					)
				)
			)
		)
	},
	handleSubmit: function(e) {
		OI.updateProject($(e.target).serialize());
		/*
		if (!this.image) {
			Materialize.toast("Image was not selected!");
			return;
		}
		*/
		e.preventDefault();
	},
});
