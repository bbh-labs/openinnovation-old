Project.Overview = React.createClass({
	getInitialState: function() {
		return {editMode: false};
	},
	render: function() {
		var user = this.props.user;
		var project = this.props.project;
		var editMode = this.state.editMode;
		return (
			<div id="project-overview" className="col s12">
				<div className="main col s12 m8 l9">
					<div className={classNames("card", editMode && "blue white-text")}>
						<div className="card-content">
							<h5>Description
								<a href="#" onClick={this.handleClick}>
									<i className={classNames("material-icons right", editMode && "white-text")}>
										{editMode ? "done" : "mode edit"}
									</i>
								</a>
							</h5>
							{this.descriptionElement()}
						</div>
					</div>
				</div>
				<div className="sidebar col s12 m4 l3">
					<div className="card small">
						<div className="card-image">
							<h5 className="card-title">Team Size</h5>
						</div>
						<div className="card-content">
							<h1>{project.members.length}</h1>
							<p>{project.members.length <= 1 ? "person" : "people"}</p>
						</div>
					</div>
					{
						user.id == project.authorID ?
						<Link className="btn waves-effect waves-light col s12" to="edit-project" params={{projectID: project.id}}>Edit Project</Link> : ""
					}
				</div>
			</div>
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
			return <p className="no-outline" ref="description" contentEditable>{this.props.project.description}</p>
		}
		return <p ref="description">{this.props.project.description}</p>
	},
});
