var NewProject = React.createClass({displayName: "NewProject",
	render: function() {
		return (
			React.createElement("div", {className: "new-project"}, 
				React.createElement(Header, null), 
				React.createElement("main", null, 
					React.createElement(NewProject.Cover, null), 
					React.createElement(NewProject.Form, null)
				), 
				React.createElement(Footer, null)
			)
		)
	},
});

NewProject.Cover = React.createClass({displayName: "Cover",
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
						file: file
					});
                    dropzone.style.background = "url(" + e.target.result + ") center / cover";
                }.bind(this);
                reader.readAsDataURL(file);
            }.bind(this),
		});
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
	getInitialState: function() {
		return {showOther: false};
	},
	componentDidMount: function() {
		dispatcher.register(function(payload) {
			if (payload.type === "new-project-image-file") {
				React.findDOMNode(this.refs.projectImage).value = payload.file;
			}
		});
	},
	render: function() {
		return (
			React.createElement("div", {className: "row container"}, 
				React.createElement("form", {className: "col s8 offset-s2", onSubmit: this.handleSubmit}, 
					React.createElement("input", {type: "file", name: "project-image", ref: "projectImage"}), 
					React.createElement("div", {className: "row"}, 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {type: "text", name: "project-name", id: "project-name", className: "validate"}), 
							React.createElement("label", {htmlFor: "project-name"}, "Name")
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
		if (this.props.file) {
			var form = React.findDOMNode(this.refs.form);
			if (form.elements["project-title"].value.length <= 1) {
				Materialize.toast("Title is too short!");
			} else if (form.elements["project-tagline"].value.length <= 32) {
				Materialize.toast("Tagline is too short!");
			} else if (form.elements["project-description"].value.length <= 64) {
				Materialize.toast("Description is too short!");
			}
		}
		e.preventDefault();
	},
	onProjectTypeChanged: function(e) {
		if (e.target.value == "other") {
			this.setState({showOther: true});
		} else {
			this.setState({showOther: false});
		}
	},
});
