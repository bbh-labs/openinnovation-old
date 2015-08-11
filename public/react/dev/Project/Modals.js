Project.Tasks.Modal = React.createClass({
	componentDidMount: function() {
		var modalTrigger = React.findDOMNode(this.refs.modalTrigger);
		$(modalTrigger).leanModal();

		var form = React.findDOMNode(this);
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "viewTask":
				if (this.props.type != "view") {
					return;
				}

				var task = payload.data;
				form.elements["taskID"].value = task.id;
				form.elements["title"].value = task.title;
				form.elements["description"].value = task.description;

				this.refs.tags.removeAll();
				if (task.tags) {
					task.tags.forEach(function(tag) {
						this.refs.tags.createTag(tag);
					}.bind(this));
				}

				this.refs.startDate.set("select", task.startDateStr, {format: "dd mmmm, yyyy"});
				this.refs.endDate.set("select", task.endDateStr, {format: "dd mmmm, yyyy"});

				$(form).openModal();
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
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
							<DatePicker id="task-start-date" name="startDate" readOnly={readOnly} ref="startDate" />
							<label htmlFor="task-start-date" className={active}>Start Date</label>
						</div>
						<div className="input-field col s6">
							<DatePicker id="task-end-date" name="endDate" readOnly={readOnly} ref="endDate" />
							<label htmlFor="task-end-date" className={active}>End Date</label>
						</div>
						<div className="input-field col s12">
							<TagIt ref="tags" onChange={this.handleTagsChange} />
						</div>
						<div className="col s12 margin-top">
							<a className="waves-effect waves-light btn modal-trigger" href="#modal-workers" ref="modalTrigger">Assign Someone</a>
						</div>
						<input type="hidden" ref="tagsInput" />
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
			var ff = $(form).serialize();
			console.log(ff);
			OI.updateTask(ff);
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
	handleTagsChange: function(e, ui) {
		var tags = $(e.target).tagit("assignedTags").join(",");
		React.findDOMNode(this.refs.tagsInput).value = tags;
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
								return <Project.Tasks.WorkersModal.Item key={m.id}
													member={m}
													isWorker={this.isWorker(m)}
													task={task} />
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

		if (!task) {
			return false;
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
				<img className="circle" src={member.avatarURL} />
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

Project.Milestones.Modal = React.createClass({
	componentDidMount: function() {
		var form = React.findDOMNode(this);

		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "viewMilestone":
				if (this.props.type != "view") {
					return;
				}

				var milestone = payload.data;
				form.elements["title"].value = milestone.title;
				form.elements["description"].value = milestone.description;
				form.elements["milestoneID"].value = milestone.id;
				this.refs.date.set("select", milestone.dateStr, {format: "dd mmmm, yyyy"});

				$(form).openModal();
				break;
			case "createMilestone":
				if (this.props.type != "create") {
					return;
				}

				form.reset();
				$(form).openModal();
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
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
							<input id="milestone-title" type="text" className="validate" name="title" readOnly={readOnly} />
							<label htmlFor="milestone-title" className={active}>Title</label>
						</div>
						<div className="input-field col s12">
							<textarea id="milestone-description" className="materialize-textarea" name="description" readOnly={readOnly}></textarea>
							<label htmlFor="milestone-description" className={active}>Description</label>
						</div>
						<div className="input-field col s6">
							<DatePicker id="milestone-date" name="date" readOnly={readOnly} ref="date" />
							<label htmlFor="milestone-date" className={active}>Date</label>
						</div>
						<input name="milestoneID" type="hidden" />
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
		switch (this.props.type) {
		case "view":
			OI.updateMilestone($(e.target).serialize());
			break;
		case "create":
			OI.createMilestone($(e.target).serialize());
			break;
		}
		e.preventDefault();
	},
	handleDelete: function(e) {
		var form = React.findDOMNode(this);

		switch (this.props.type) {
		case "view":
			OI.deleteMilestone($(form).serialize());
			break;
		}

		e.preventDefault();
	},
});
