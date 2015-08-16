var CreateTask = React.createClass({
	mixins: [ Navigation, State ],
	componentDidMount: function() {
		var projectID = this.getParams().projectID;
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "createTaskDone":
				this.transitionTo("project", {projectID: projectID});
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var projectID = this.getParams().projectID;
		return (
			<form className="row" id={this.props.id} onSubmit={this.handleSubmit}>
				<div className="container">
					<div className="input-field col s12">
						<input id="task-title" type="text" className="validate" name="title" />
						<label htmlFor="task-title">Title</label>
					</div>
					<div className="input-field col s12">
						<textarea id="task-description" className="materialize-textarea" name="description"></textarea>
						<label htmlFor="task-description">Description</label>
					</div>
					<div className="input-field col s6">
						<DatePicker id="task-start-date" name="startDate" ref="startDate" />
						<label htmlFor="task-start-date">Start Date</label>
					</div>
					<div className="input-field col s6">
						<DatePicker id="task-end-date" name="endDate" ref="endDate" />
						<label htmlFor="task-end-date">End Date</label>
					</div>
					<div className="input-field col s12">
						<TagIt ref="tags" onChange={this.handleTagsChange} />
					</div>
					<input type="hidden" ref="tagsInput" />
					<input name="projectID" type="hidden" value={projectID} />
					<div className="input-field col s12">
						<div className="right">
							<Link className="btn waves-effect waves-green"
								params={{projectID: projectID}}
								to="project">Back to Project</Link>
							<button className="btn waves-effect waves-green blue white-text"
								type="submit">Done</button>
						</div>
					</div>
				</div>
			</form>
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();
		OI.createTask($(e.target).serialize());
	},
	handleTagsChange: function(e, ui) {
		var tags = $(e.target).tagit("assignedTags").join(",");
		React.findDOMNode(this.refs.tagsInput).value = tags;
	},
});

