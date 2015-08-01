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
							<option value="">Any type</option>{
							this.state.titles.map(function(i, p) {
								return <option key={p} value={p}>{p}</option>
							})
						}</select>
					</div>
					<div className="input-field col s12 m3 offset-m3">
						<button className="btn waves-effect waves-light modal-trigger input-button col s12"
								ref="modalTrigger"
								data-target="create-task">
							Add Task
						</button>
					</div>
					<div className="col s12">
						<ul className="collection">{
							this.props.project.tasks ? this.props.project.tasks.map(function(t) {
								if (!t.done) {
									return <Project.Tasks.Item key={t.id} task={t} />
								}
							}) : ""
						}</ul>
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
							<option value="">Any type</option>{
							this.state.titles.map(function(i, p) {
								return <option key={p} value={p}>{p}</option>
							})
						}</select>
					</div>
					<div className="col s12">
						<Project.Tasks.WorkersModal project={project} clickedTask={clickedTask} />
						<Project.Tasks.Modal id="create-task" project={project} clickedTask={clickedTask} type="create" />
						<Project.Tasks.Modal id="view-task" project={project} clickedTask={clickedTask} type="view" />
						<ul className="collection">{
							this.props.project.tasks ?
							this.props.project.tasks.map(function(t) {
								if (t.done) {
									return <Project.Tasks.Item key={t.id} task={t} />
								}
							}) : ""
						}</ul>
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
	titleElements: function() {
		return buildElements(this.state.titles, function(i, p) {
			return <option key={p} value={p}>{p}</option>
		});
	},
	onTaskClicked: function(e, i) {
		this.setState({clickedTask: i});
		e.preventDefault();
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
					{this.workerElements()}
					{this.doneElement()}
				</div>
			</li>
		)
	},
	handleClick: function(e) {
		var task = this.props.task;
		this.props.onTaskClicked(e, task.id);

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
	workerElements: function(e) {
		var workers = this.props.task.workers;
		if (!workers) {
			workers = [];
		}
		return workers.map(function(w) {
			return <Project.Tasks.Worker worker={w} />
		});
	},
	doneElement: function(e) {
		var task = this.props.task;
		return <i style={{cursor: "pointer", visibility: this.state.hovering || task.done ? "visible" : "hidden"}}
				  onClick={this.handleToggleStatus}
				  className={classNames("material-icons", task.done && "green-text")}>done</i>
	},
});

Project.Tasks.Worker = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this)).tooltip({delay: 50});
	},
	render: function() {
		var worker = this.props.worker;
		return <img className="task-worker tooltipped"
					data-position="bottom"
					data-delay="50"
					data-tooltip={worker.fullname}
					src="images/profile-pics/1.jpg" />
	},
});
