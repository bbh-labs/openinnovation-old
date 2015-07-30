Project.Tasks = React.createClass({
	getInitialState: function() {
		return {titles: []};
	},
	componentDidMount: function() {
		$.ajax({
			url: "/titles.json",
			method: "GET",
			dataType: "json",
		}).done(function(resp) {
			this.setState({titles: resp});
		}.bind(this)).fail(function(resp) {
			console.log(resp.responseText);
		});

		$(React.findDOMNode(this.refs.modalTrigger)).leanModal({
			dismissable: true,
		});
	},
	render: function() {
		var project = this.props.project;
		return (
			<div id="project-tasks" className="col s12">
				<div className="main col l9">
					<div className="col s12 margin-top">
						<h5>To Do</h5>
					</div>
					<div className="input-field col s12 m3">
						<input id="task-search" type="text" required />
						<label htmlFor="task-search">Search</label>
					</div>
					<div className="input-field col s12 m3">
						<select className="browser-default" defaultValue="">
							<option value="">Any type</option>
							{this.titleElements()}
						</select>
					</div>
					<div className="input-field col s12 m3 offset-m3">
						<button className="btn waves-effect waves-light modal-trigger input-button col s12"
								ref="modalTrigger"
								data-target="create-task">
							Add Task
						</button>
					</div>
					<div className="col s12">
						<Project.Tasks.Modal id="create-task" project={project} type="create" />
						<Project.Tasks.Modal id="view-task" project={project} type="view" />
						<ul className="collection">
							{this.unfinishedTaskElements()}
						</ul>
					</div>
					<div className="col s12 margin-top">
						<h5>Finished</h5>
					</div>
					<div className="input-field col s12 m3">
						<input id="task-search" type="text" required />
						<label htmlFor="task-search">Search</label>
					</div>
					<div className="input-field col s12 m3">
						<select className="browser-default" defaultValue="">
							<option value="">Any type</option>
							{this.titleElements()}
						</select>
					</div>
					<div className="col s12">
						<Project.Tasks.WorkersModal />
						<Project.Tasks.Modal id="create-task" project={project} type="create" />
						<Project.Tasks.Modal id="view-task" project={project} type="view" />
						<ul className="collection">
							{this.finishedTaskElements()}
						</ul>
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
	unfinishedTaskElements: function() {
		var tasks = this.props.project.tasks;
		return buildElements(tasks, function(i, t) {
			if (!t.done) {
				return <Project.Tasks.Item key={t.id} task={t} />
			}
		});
	},
	finishedTaskElements: function() {
		var tasks = this.props.project.tasks;
		return buildElements(tasks, function(i, t) {
			if (t.done) {
				return <Project.Tasks.Item key={t.id} task={t} />
			}
		});
	},
	titleElements: function() {
		return buildElements(this.state.titles, function(i, p) {
			return <option key={p} value={p}>{p}</option>
		});
	},
});

Project.Tasks.Item = React.createClass({
	getInitialState: function() {
		return {hovering: false};
	},
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.viewTask)).leanModal({
			dismissable: true,
		});
	},
	render: function() {
		var task = this.props.task;
		return (
			<li className="collection-item" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<a ref="viewTask" href="#view-task" onClick={this.handleClick}>
					{task.title}
				</a>
				<div className="secondary-content">
					<img className="task-worker" src="images/profile-pics/1.jpg" />
					<img className="task-worker" src="images/profile-pics/1.jpg" />
					<img className="task-worker" src="images/profile-pics/1.jpg" />
					{this.doneElement()}
				</div>
			</li>
		)
	},
	handleClick: function(e) {
		dispatcher.dispatch({
			type: "viewTask",
			data: this.props.task,
		});
		e.preventDefault();
	},
	handleToggleStatus: function(e) {
		OI.toggleTaskStatus({taskID: this.props.task.id});
	},
	handleMouseEnter: function(e) {
		this.setState({hovering: true});
	},
	handleMouseLeave: function(e) {
		this.setState({hovering: false});
	},
	doneElement: function(e) {
		var task = this.props.task;
		var done = task.done;
		return <i style={{cursor: "pointer", visibility: this.state.hovering || done ? "visible" : "hidden"}}
				  onClick={this.handleToggleStatus}
				  className={classNames("material-icons", done && "green-text")}>done</i>
	},
});

Project.Tasks.Modal = React.createClass({
	componentDidMount: function() {
		var tags = React.findDOMNode(this.refs.tags);
		$(tags).tagsInput();

		if (this.props.type == "view") {
			this.dispatchID = dispatcher.register(function(payload) {
				switch (payload.type) {
				case "viewTask":
					this.loadTask(payload.data);
					break;
				}
			}.bind(this));
		}

		var modalTrigger = React.findDOMNode(this.refs.modalTrigger);
		$(modalTrigger).leanModal();
	},
	componentWillUnmount: function() {
		if (this.props.type == "view") {
			dispatcher.unregister(this.dispatchID);
		}
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
						<a className="waves-effect waves-light btn modal-trigger" href="#modal-workers" ref="modalTrigger">Workers</a>
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
			OI.newTask($(form).serialize());
		} else if (type == "view") {
			OI.updateTask($(form).serialize());
		}
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
		form.elements["startDate"].value = task.startDateStr;
		form.elements["endDate"].value = task.endDateStr;
		form.elements["tags"].value = task.tags;
	},
});

Project.Tasks.WorkersModal = React.createClass({
	render: function() {
		return (
			<div id="modal-workers" className="modal bottom-sheet">
				<div className="modal-content">
					<h4>Modal Header</h4>
					<p>A bunch of text</p>
				</div>
				<div className="modal-footer">
					<a href="#" className="modal-action modal-close waves-effect waves-green btn-flat">Agree</a>
				</div>
			</div>
		)
	},
});
