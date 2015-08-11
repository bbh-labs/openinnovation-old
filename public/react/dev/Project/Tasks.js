Project.Tasks = React.createClass({
	getInitialState: function() {
		return {titles: [], clickedTask: -1};
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
		var clickedTask = this.state.clickedTask;
		return (
			<div id="project-tasks" className="col s12">
				<div className="main col s12">
					<div className="input-field col s12 m3 offset-m9">
						<button className="btn waves-effect waves-light modal-trigger input-button col s12"
								ref="modalTrigger"
								data-target="create-task">
							Add Task
						</button>
					</div>
					<div className="col s12">
						<h5>To Do</h5>
					</div>
					<div className="col s12">
						<ul ref="todo" className="collection task-group">{
							this.props.project.tasks ? this.props.project.tasks.map(function(t) {
								if (!t.done) {
									return <TaskItem key={t.id} task={t} onTaskClicked={this.onTaskClicked} />
								}
							}.bind(this)) : ""
						}</ul>
					</div>
					<div className="col s12 margin-top">
						<h5>Done</h5>
					</div>
					<div className="col s12">
						<Project.Tasks.WorkersModal project={project} clickedTask={clickedTask} />
						<Project.Tasks.Modal id="create-task" project={project} clickedTask={clickedTask} type="create" />
						<Project.Tasks.Modal id="view-task" project={project} clickedTask={clickedTask} type="view" />
						<ul ref="done" className="collection task-group">{
							this.props.project.tasks ?
							this.props.project.tasks.map(function(t) {
								if (t.done) {
									return <TaskItem key={t.id} task={t} onTaskClicked={this.onTaskClicked} />
								}
							}.bind(this)) : ""
						}</ul>
					</div>
				</div>
			</div>
		)
	},
	titleElements: function() {
		return buildElements(this.state.titles, function(i, p) {
			return <option key={p} value={p}>{p}</option>
		});
	},
	onTaskClicked: function(e, task) {
		this.setState({clickedTask: task.id});

		dispatcher.dispatch({
			type: "viewTask",
			data: task,
		});
	},
});

Project.Tasks.Worker = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this)).tooltip({delay: 50});
	},
	render: function() {
		var worker = this.props.worker;
		return (
			<Link to="user" params={{userID: worker.id}}
					data-position="bottom"
					data-delay="50"
					data-tooltip={worker.fullname}>
				<img className="task-worker tooltipped"
						src={worker.avatarURL}/>
			</Link>
		)
	},
});
