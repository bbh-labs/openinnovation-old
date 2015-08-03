Project.Tasks = React.createClass({displayName: "Tasks",
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
			React.createElement("div", {id: "project-tasks", className: "col s12"}, 
				React.createElement("div", {className: "main col s12"}, 
					React.createElement("div", {className: "col s12 margin-top"}, 
						React.createElement("h5", null, "To Do")
					), 
					React.createElement("div", {className: "input-field col s12 m3"}, 
						React.createElement("input", {id: "task-search", type: "text", required: true}), 
						React.createElement("label", {htmlFor: "task-search"}, "Search")
					), 
					React.createElement("div", {className: "input-field col s12 m3"}, 
						React.createElement("select", {className: "browser-default", defaultValue: ""}, 
							React.createElement("option", {value: ""}, "Any type"), 
							this.state.titles.map(function(i, p) {
								return React.createElement("option", {key: p, value: p}, p)
							})
						)
					), 
					React.createElement("div", {className: "input-field col s12 m3 offset-m3"}, 
						React.createElement("button", {className: "btn waves-effect waves-light modal-trigger input-button col s12", 
								ref: "modalTrigger", 
								"data-target": "create-task"}, 
							"Add Task"
						)
					), 
					React.createElement("div", {className: "col s12"}, 
						React.createElement("ul", {className: "collection"}, 
							this.props.project.tasks ? this.props.project.tasks.map(function(t) {
								if (!t.done) {
									return React.createElement(Project.Tasks.Item, {key: t.id, project: project, task: t, onTaskClicked: this.onTaskClicked})
								}
							}.bind(this)) : ""
						)
					), 
					React.createElement("div", {className: "col s12 margin-top"}, 
						React.createElement("h5", null, "Finished")
					), 
					React.createElement("div", {className: "input-field col s12 m3"}, 
						React.createElement("input", {id: "task-search", type: "text", required: true}), 
						React.createElement("label", {htmlFor: "task-search"}, "Search")
					), 
					React.createElement("div", {className: "input-field col s12 m3"}, 
						React.createElement("select", {className: "browser-default", defaultValue: ""}, 
							React.createElement("option", {value: ""}, "Any type"), 
							this.state.titles.map(function(i, p) {
								return React.createElement("option", {key: p, value: p}, p)
							})
						)
					), 
					React.createElement("div", {className: "col s12"}, 
						React.createElement(Project.Tasks.WorkersModal, {project: project, clickedTask: clickedTask}), 
						React.createElement(Project.Tasks.Modal, {id: "create-task", project: project, clickedTask: clickedTask, type: "create"}), 
						React.createElement(Project.Tasks.Modal, {id: "view-task", project: project, clickedTask: clickedTask, type: "view"}), 
						React.createElement("ul", {className: "collection"}, 
							this.props.project.tasks ?
							this.props.project.tasks.map(function(t) {
								if (t.done) {
									return React.createElement(Project.Tasks.Item, {key: t.id, project: project, task: t, onTaskClicked: this.onTaskClicked})
								}
							}.bind(this)) : ""
						)
					)
				)
			)
		)
	},
	titleElements: function() {
		return buildElements(this.state.titles, function(i, p) {
			return React.createElement("option", {key: p, value: p}, p)
		});
	},
	onTaskClicked: function(e, i) {
		this.setState({clickedTask: i});
	},
});

Project.Tasks.Item = React.createClass({displayName: "Item",
	getInitialState: function() {
		return {hovering: false};
	},
	render: function() {
		var task = this.props.task;
		return (
			React.createElement("li", {className: "collection-item", onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave}, 
				React.createElement("a", {href: "", onClick: this.handleClick}, 
					task.title
				), 
				React.createElement("div", {className: "secondary-content"}, 
				
					this.props.task.workers ?
					this.props.task.workers.map(function(w) {
						return React.createElement(Project.Tasks.Worker, {worker: w})
					}) : "", 
				
					React.createElement("i", {style: {cursor: "pointer", visibility: this.state.hovering || task.done ? "visible" : "hidden"}, 
							  onClick: this.handleToggleStatus, 
							  className: classNames("material-icons", task.done && "green-text")}, "done")
				)
			)
		)
	},
	handleClick: function(e) {
		e.preventDefault();
		var task = this.props.task;
		this.props.onTaskClicked(e, task.id);

		dispatcher.dispatch({
			type: "viewTask",
			data: task,
		});
	},
	handleToggleStatus: function(e) {
		OI.toggleTaskStatus({
			projectID: this.props.project.id,
			taskID: this.props.task.id
		});
	},
	handleMouseEnter: function(e) {
		this.setState({hovering: true});
	},
	handleMouseLeave: function(e) {
		this.setState({hovering: false});
	},
	workerElements: function(e) {
		return workers.map(function(w) {
			return React.createElement(Project.Tasks.Worker, {worker: w})
		});
	},
	doneElement: function(e) {
		var task = this.props.task;
		return React.createElement("i", {style: {cursor: "pointer", visibility: this.state.hovering || task.done ? "visible" : "hidden"}, 
				  onClick: this.handleToggleStatus, 
				  className: classNames("material-icons", task.done && "green-text")}, "done")
	},
});

Project.Tasks.Worker = React.createClass({displayName: "Worker",
	componentDidMount: function() {
		$(React.findDOMNode(this)).tooltip({delay: 50});
	},
	render: function() {
		var worker = this.props.worker;
		return (
			React.createElement(Link, {to: "user", params: {userID: worker.id}, 
					"data-position": "bottom", 
					"data-delay": "50", 
					"data-tooltip": worker.fullname}, 
				React.createElement("img", {className: "task-worker tooltipped", 
						src: worker.avatarURL})
			)
		)
	},
});
