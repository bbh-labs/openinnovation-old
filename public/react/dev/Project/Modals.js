Project.Tasks.Modal = React.createClass({
	componentDidMount: function() {
		var tags = React.findDOMNode(this.refs.tags);
		$(tags).tagsInput();
	
		var modalTrigger = React.findDOMNode(this.refs.modalTrigger);
		$(modalTrigger).leanModal();
	},
	componentDidUpdate: function() {
		var clickedTask = this.props.clickedTask;
		if (clickedTask < 0) {
			return;
		}

		var tasks = this.props.project.tasks;
		var task;

		for (var i = 0; i < tasks.length; i++) {
			if (tasks[i].id == clickedTask) {
				task = tasks[i];
			}
		}
	
		var form = React.findDOMNode(this);
		form.elements["taskID"].value = task.id;
		form.elements["title"].value = task.title;
		form.elements["description"].value = task.description;
		form.elements["startDate"].value = task.startDateStr;
		form.elements["endDate"].value = task.endDateStr;
		form.elements["tags"].value = task.tags;
	},
	render: function() {
		var project = this.props.project;
		var type = this.props.type;
		var active = type == "view" ? "active" : "";
		var readOnly = !project.isMember;
		return (
			<form id={this.props.id} className="modal" onSubmit={this.handleSubmit}>
				<div className="modal-content">
					<div className="row">
						<div className="input-field col s12">
							<input id="task-title" type="text" className="validate" name="title" readOnly={readOnly} />
							<label htmlFor="task-title" className={active}>Title</label>
						</div>
						<div className="input-field col s12">
							<textarea id="task-description" className="materialize-textarea" name="description" readOnly={readOnly}></textarea>
							<label htmlFor="task-description" className={active}>Description</label>
						</div>
						<div className="input-field col s6">
							<DatePicker id="task-start-date" name="startDate" readOnly={readOnly} />
							<label htmlFor="task-start-date" className={active}>Start Date</label>
						</div>
						<div className="input-field col s6">
							<DatePicker id="task-end-date" name="endDate" readOnly={readOnly} />
							<label htmlFor="task-end-date" className={active}>End Date</label>
						</div>
						<div className="input-field col s12">
							<input name="tags" ref="tags" readOnly={readOnly} />
						</div>
						<div className="col s12 margin-top">
							<a className="waves-effect waves-light btn modal-trigger" href="#modal-workers" ref="modalTrigger">Assign Someone</a>
						</div>
						<input name="taskID" type="hidden" />
						<input name="projectID" type="hidden" value={project.id} />
					</div>
				</div>
				<div className="modal-footer">
					{
						type == "view" && !readOnly ?
						<button className="btn modal-action modal-close waves-effect waves-green left red white-text" onClick={this.handleDelete}>Delete</button> : ""
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
		var type = this.props.type;
		if (type == "create") {
			OI.createTask($(form).serialize());
		} else if (type == "view") {
			OI.updateTask($(form).serialize());
		}
	},
	handleDelete: function(e) {
		e.preventDefault();

		if (this.props.readOnly) {
			return;
		}

		var form = React.findDOMNode(this);
		OI.deleteTask({
			projectID: form.elements["projectID"].value,
			taskID: form.elements["taskID"].value,
		});
	},
});

Project.Tasks.WorkersModal = React.createClass({
	render: function() {
		var clickedTask = this.props.clickedTask;
		if (clickedTask < 0) {
			return <div />
		}

		var tasks = this.props.project.tasks;
		var task;
		for (var i = 0; i < tasks.length; i++) {
			if (tasks[i].id == clickedTask) {
				task = tasks[i];
			}
		}

		return (
			<div id="modal-workers" className="modal bottom-sheet">
				<div className="modal-content">
					<div className="container">
						<ul className="collection">{
							this.props.project.members.map(function(m) {
								return <Project.Tasks.WorkersModal.Item key={m.id} member={m} isWorker={this.isWorker(m)} task={task} />
							}.bind(this))
						}</ul>
					</div>
				</div>
			</div>
		)
	},
	isWorker: function(member) {
		var clickedTask = this.props.clickedTask;
		if (clickedTask < 0) {
			return false;
		}

		var tasks = this.props.project.tasks;
		var task;
		for (var i = 0; i < tasks.length; i++) {
			if (tasks[i].id == clickedTask) {
				task = tasks[i];
			}
		}

		var workers = task.workers;
		if (!workers) {
			workers = [];
		}

		for (var i = 0; i < workers.length; i++) {
			if (workers[i].id == member.id) {
				return true;
			}
		}

		return false;
	},
});

Project.Tasks.WorkersModal.Item = React.createClass({
	render: function() {
		var member = this.props.member;
		var isWorker = this.props.isWorker;
		return (
			<li className={classNames("collection-item avatar pointer", isWorker && "teal white-text")} onClick={this.handleClick}>
				<img className="circle" src="images/profile-pics/1.jpg" />
				<span className="title"><strong>{member.fullname}</strong></span>
				<p>{member.title}</p>
				<Link to="user" params={{userID: member.id}} className="secondary-content">
					<i className="material-icons">send</i>
				</Link>
			</li>
		)
	},
	handleClick: function(e) {
		var taskID = this.props.task.id;
		var memberID = this.props.member.id;

		OI.assignWorker({
			taskID: taskID,
			userID: memberID,
			toggle: true,
		});

		e.preventDefault();
	},
});
