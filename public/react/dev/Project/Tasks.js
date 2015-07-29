Project.Tasks = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.modalTrigger)).leanModal({
			dismissable: true,
		});
	},
	render: function() {
		var project = this.props.project;
		return (
			<div id="project-tasks" className="col s12">
				<div className="main col l9">
					<div className="input-field col s12 m3">
						<input id="task-search" type="text" required />
						<label htmlFor="task-search">Search</label>
					</div>
					<div className="input-field col s12 m3">
						<select className="browser-default" defaultValue="">
							<option value="">Any type</option>
							<option value="artist">Artist</option>
							<option value="copywriter">Copywriter</option>
							<option value="designer">Designer</option>
							<option value="programmer">Programmer</option>
							<option value="manager">Manager</option>
							<option value="planner">Planner</option>
							<option value="producer">Producer</option>
						</select>
					</div>
					<div className="input-field col s12 m3">
						<select className="browser-default" defaultValue="">
							<option value="">Any urgency</option>
							<option value="relaxed">Least urgent first</option>
							<option value="urgent">Most urgent first</option>
						</select>
					</div>
					<div className="col s12">
						<Project.Tasks.Modal id="create-task" readOnly={false} project={project} />
						<Project.Tasks.Modal id="view-task" readOnly={true} project={project} />
						<ul className="collection">
							{this.taskElements()}
						</ul>
					</div>
					<div className="col s12">
						<button className="btn waves-effect waves-light modal-trigger col s12 m4"
								ref="modalTrigger"
								data-target="create-task">
							Add Task
						</button>
					</div>
				</div>
				<div className="sidebar col s12 m4 l3">
					<div className="card small">
						<div className="card-image">
							<h5 className="card-title">Completed</h5>
						</div>
						<div className="card-content">
							<h1>40/56</h1>
							<p>tasks</p>
						</div>
					</div>
				</div>
			</div>
		)
	},
	taskElements: function() {
		var tasks = this.props.project.tasks;
		return buildElements(tasks, function(i, t) {
			return <Project.Tasks.Item task={t} />
		});
	},
});

Project.Tasks.Item = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this)).leanModal({
			dismissable: true,
		});
	},
	render: function() {
		var task = this.props.task;
		return (
			<a href="#view-task" className="collection-item modal-trigger" onClick={this.handleClick}>
				{task.title}
			</a>
		)
	},
	handleClick: function(e) {
		dispatcher.dispatch({
			type: "viewTask",
			data: this.props.task,
		});
		e.preventDefault();
	},
});

Project.Tasks.Modal = React.createClass({
	componentDidMount: function() {
		var tags = React.findDOMNode(this.refs.tags);
		$(tags).tagsInput();

		if (this.props.readOnly) {
			this.dispatchID = dispatcher.register(function(payload) {
				switch (payload.type) {
				case "viewTask":
					this.loadTask(payload.data);
					break;
				}
			}.bind(this));
		}
	},
	componentWillUnmount: function() {
		if (this.props.readOnly) {
			dispatcher.unregister(this.dispatchID);
		}
	},
	render: function() {
		var project = this.props.project;
		var type = this.props.type;
		return (
			<form id={this.props.id} className="modal" onSubmit={this.handleSubmit}>
				<div className="modal-content">
					<div className="row">
						<div className="input-field col s12">
							<input id="task-title" type="text" className="validate" name="title" readOnly={this.props.readOnly} />
							<label htmlFor="task-title">Title</label>
						</div>
						<div className="input-field col s12">
							<textarea id="task-description" className="materialize-textarea" name="description" readOnly={this.props.readOnly}></textarea>
							<label htmlFor="task-description">Description</label>
						</div>
						<div className="input-field col s6">
							<DatePicker id="task-start-date" name="startDate" readOnly={this.props.readOnly} />
							<label htmlFor="task-start-date">Start Date</label>
						</div>
						<div className="input-field col s6">
							<DatePicker id="task-end-date" name="endDate" readOnly={this.props.readOnly} />
							<label htmlFor="task-end-date">End Date</label>
						</div>
						<div className="input-field col s12">
							<input name="tags" ref="tags" readOnly={this.props.readOnly} />
						</div>
						<input name="taskID" type="hidden" />
						<input name="projectID" type="hidden" value={project.id} />
					</div>
				</div>
				<div className="modal-footer">
					{
						this.props.readOnly ?
						<button className="btn modal-action modal-close waves-effect waves-green left red white-text" onClick={this.handleDelete}>Delete</button> :
						""
					}
					<button type="submit" className="btn modal-action modal-close waves-effect waves-green right blue white-text">Done</button>
				</div>
			</form>
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();

		if (this.props.readOnly) {
			return;
		}

		var form = React.findDOMNode(this);
		OI.newTask($(form).serialize());
	},
	handleDelete: function(e) {
		e.preventDefault();

		if (!this.props.readOnly) {
			return;
		}

		var form = React.findDOMNode(this);
		OI.deleteTask({
			projectID: form.elements["projectID"].value,
			taskID: form.elements["taskID"].value,
		});
	},
	loadTask: function(task) {
		var form = React.findDOMNode(this);
		form.elements["taskID"].value = task.id;
		form.elements["title"].value = task.title;
		form.elements["description"].value = task.description;
		form.elements["startDate"].value = task.startDate;
		form.elements["endDate"].value = task.endDate;
		form.elements["tags"].value = task.tags;
	},
});

