var NewProject = React.createClass({displayName: "NewProject",
	render: function() {
		return (
			React.createElement("main", {className: "new-project"}, 
				React.createElement(NewProject.Cover, null), 
				React.createElement(NewProject.Form, null)
			)
		)
	},
});

NewProject.Cover = React.createClass({displayName: "Cover",
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
						type: "new-project-image-file",
						file: file,
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

NewProject.Form = React.createClass({displayName: "Form",
	image: null,
	getInitialState: function() {
		return {showOther: false};
	},
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			if (payload.type === "new-project-image-file") {
				this.image = payload.file;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
		this.image = null;
	},
	render: function() {
		return (
			React.createElement("div", {className: "row container"}, 
				React.createElement("form", {ref: "form", className: "col s8 offset-s2", onSubmit: this.handleSubmit}, 
					React.createElement("div", {className: "row"}, 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {type: "text", name: "project-title", id: "project-title", className: "validate"}), 
							React.createElement("label", {htmlFor: "project-title"}, "Name")
						)
					), 
					React.createElement("div", {className: "row"}, 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {type: "text", name: "project-tagline", id: "project-tagline", className: "validate"}), 
							React.createElement("label", {htmlFor: "project-tagline"}, "Tagline")
						)
					), 
					React.createElement("div", {className: "row"}, 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("textarea", {id: "project-description", name: "project-description", className: "materialize-textarea"}), 
							React.createElement("label", {htmlFor: "project-description"}, "Description")
						)
					), 
					React.createElement("div", {className: "row"}, 
						React.createElement("div", {className: "col s12"}, 
							React.createElement("label", null, "Type"), 
							React.createElement("select", {onChange: this.onProjectTypeChanged, name: "project-type", className: "browser-default", defaultValue: ""}, 
								React.createElement("option", {value: "", disabled: true}, "What's the project type?"), 
								React.createElement("option", {value: "advertisement"}, "Advertisement"), 
								React.createElement("option", {value: "installation"}, "Installation"), 
								React.createElement("option", {value: "tvcommercial"}, "TV Commercial"), 
								React.createElement("option", {value: "website"}, "Website"), 
								React.createElement("option", {value: "other"}, "Other")
							), 
							
								this.state.showOther ?  React.createElement("input", {type: "text", id: "project-type-other"}) : ""
							
						)
					), 
					React.createElement("button", {type: "submit", className: "waves-effect waves-light btn"}, "Submit")
				)
			)
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();

		if (!this.image) {
			Materialize.toast("Image was not selected!");
			return;
		}

		var form = React.findDOMNode(this.refs.form);
		var title = form.elements["project-title"].value;
		var tagline = form.elements["project-tagline"].value;
		var description = form.elements["project-description"].value;
		if (title.length <= 1) {
			Materialize.toast("Title is too short!");
			return;
		} else if (tagline.length <= 5) {
			Materialize.toast("Tagline is too short!");
			return;
		} else if (description.length <= 20) {
			Materialize.toast("Description is too short!");
			return;
		}

		var fd = new FormData();
		fd.append("image", this.image);
		fd.append("title", title);
		fd.append("tagline", tagline);
		fd.append("description", description);

		OI.createProject(fd);
	},
	onProjectTypeChanged: function(e) {
		if (e.target.value == "other") {
			this.setState({showOther: true});
		} else {
			this.setState({showOther: false});
		}
	},
});
