var EditProject = React.createClass({
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
			return <div />
		}
		return (
			<main className="edit-project">
				<EditProject.Cover />
				<EditProject.Content project={project} />
			</main>
		)
	},
});

EditProject.Cover = React.createClass({
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
			<div className="parallax-container">
				<div ref="parallax" className="parallax">
					<img src="images/1.jpg" />
				</div>
				<div className="parallax-overlay valign-wrapper">
					<div className="valign">
						<h1>Upload a representative image</h1>
						<h4>It can be changed at later time</h4>
					</div>
				</div>
			</div>
		)
	},
});

EditProject.Content = React.createClass({
	image: null,
	getInitialState: function() {
		return {menuIndex: 0};
	},
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "edit-project-image-file":
				this.image = payload.file;
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
		var menuIndex = this.state.menuIndex;
		return (
			<div className="row">
				<div className="container">
					<div className="col s3">
						<div className="collection">{
							[ "Options", "Collaborators", "Services" ].map(function(s, i) {
								var cx = menuIndex == i ? "active" : "";
								return <a href="#" onClick={this.handleClick} className={classNames("collection-item", cx)}>{s}</a>
							}.bind(this))
						}</div>
					</div>
					<div className="col s9">
						{menuIndex == 0 ? <EditProject.Content.Form project={project} /> : ""}
					</div>
				</div>
			</div>
		)
	},
	handleClick: function(e) {
		//this.setState({menuIndex: i});

		e.preventDefault();
	},
});

EditProject.Content.Form = React.createClass({
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "updateProjectDone":
				Materialize.toast("Successfully updated the project", 1000);
				break;
			case "updateProjectFail":
				Materialize.toast("Failed to update the project", 1000);
				break;
			}
		});
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var project = this.props.project;
		return (
			<form className="col s9" onSubmit={this.handleSubmit}>
				<div className="row">
					<div className="input-field col s12">
						<input type="text" name="title" id="project-title" className="validate" defaultValue={project.title} />
						<label htmlFor="project-title" className="active">Name</label>
					</div>
				</div>
				<div className="row">
					<div className="input-field col s12">
						<input type="text" name="tagline" id="project-tagline" className="validate" defaultValue={project.tagline} />
						<label htmlFor="project-tagline" className="active">Tagline</label>
					</div>
				</div>
				<div className="row">
					<div className="input-field col s12">
						<textarea id="project-description" name="description" className="materialize-textarea" defaultValue={project.description}></textarea>
						<label htmlFor="project-description" className="active">Description</label>
					</div>
				</div>
				<input type="hidden" name="projectID" value={project.id} />
				<button className="waves-effect waves-light btn" type="submit">Update</button>
				<Link className="btn waves-effect waves-light grey" to="project" params={{projectID: project.id}}>View</Link>
			</form>
		)
	},
	handleSubmit: function(e) {
		OI.updateProject($(e.target).serialize());

		e.preventDefault();
	},
});
