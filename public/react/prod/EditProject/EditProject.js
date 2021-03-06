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
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var project = this.state.project;
		if (!this.state.project) {
			return React.createElement("div", null)
		}
		return (
			React.createElement("main", {className: "edit-project"}, 
				React.createElement("h5", {style: Styles.PageTitle}, "Edit Project"), 
				React.createElement(EditProject.Cover, {project: project}), 
				React.createElement(EditProject.Content, {project: project})
			)
		)
	},
});

EditProject.Cover = React.createClass({displayName: "Cover",
	mixins: [ Navigation ],
	componentDidMount: function() {
		var dropzone = React.findDOMNode(this);
		
		dropzone.style.background = "url(" + this.props.project.imageURL + ") center / cover";

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
						type: "editProjectImageFile",
						image: file,
					});
					dropzone.style.background = "url(" + e.target.result + ") center / cover";
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
				case http.StatusInternalServerError:
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

EditProject.Content = React.createClass({displayName: "Content",
	render: function() {
		var project = this.props.project;
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement("div", {className: "container"}, 
					React.createElement("div", {className: "col s12"}, 
						React.createElement(EditProject.Content.Form, {project: project})
					)
				)
			)
		)
	},
});

EditProject.Content.Form = React.createClass({displayName: "Form",
	image: null,
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "editProjectImageFile":
				this.image = payload.image;
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
			React.createElement("form", {className: "col s12", onSubmit: this.handleSubmit}, 
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
						React.createElement("textarea", {id: "project-description", 
							  className: "materialize-textarea", 
							  name: "description", 
							  defaultValue: project.description}), 
						React.createElement("label", {htmlFor: "project-description", className: "active"}, "Description")
					)
				), 
				React.createElement("input", {type: "hidden", name: "projectID", value: project.id}), 
				React.createElement("button", {className: "waves-effect waves-light btn", type: "submit"}, "Update"), 
				React.createElement(Link, {className: "btn waves-effect waves-light grey", to: "project", params: {projectID: project.id}}, "View")
			)
		)
	},
	handleSubmit: function(e) {
		var form = e.target;

		var fd = new FormData();
		fd.append("projectID", form.elements["projectID"].value);
		fd.append("title", form.elements["title"].value);
		fd.append("tagline", form.elements["tagline"].value);
		fd.append("description", form.elements["description"].value);
		if (this.image) {
			console.log("tset");
			fd.append("image", this.image);
		}

		OI.updateProject(fd);

		e.preventDefault();
	},
});
