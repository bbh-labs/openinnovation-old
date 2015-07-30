Project.Tasks = React.createClass({displayName: "Tasks",
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
			React.createElement("div", {id: "project-tasks", className: "col s12"}, 
				React.createElement("div", {className: "main col l9"}, 
					React.createElement("div", {className: "input-field col s12 m3"}, 
						React.createElement("input", {id: "task-search", type: "text", required: true}), 
						React.createElement("label", {htmlFor: "task-search"}, "Search")
					), 
					React.createElement("div", {className: "input-field col s12 m3"}, 
						React.createElement("select", {className: "browser-default", defaultValue: ""}, 
							React.createElement("option", {value: ""}, "Any type"), 
							this.titleElements()
						)
					), 
					React.createElement("div", {className: "input-field col s12 m3"}, 
						React.createElement("select", {className: "browser-default", defaultValue: ""}, 
							React.createElement("option", {value: ""}, "Any urgency"), 
							React.createElement("option", {value: "relaxed"}, "Least urgent first"), 
							React.createElement("option", {value: "urgent"}, "Most urgent first")
						)
					), 
					React.createElement("div", {className: "col s12"}, 
						React.createElement(Project.Tasks.Modal, {id: "create-task", project: project, type: "create"}), 
						React.createElement(Project.Tasks.Modal, {id: "view-task", project: project, type: "view"}), 
						React.createElement("ul", {className: "collection"}, 
							this.taskElements()
						)
					), 
					React.createElement("div", {className: "col s12"}, 
						React.createElement("button", {className: "btn waves-effect waves-light modal-trigger col s12 m4", 
								ref: "modalTrigger", 
								"data-target": "create-task"}, 
							"Add Task"
						)
					)
				), 
				React.createElement("div", {className: "sidebar col s12 m4 l3"}, 
					React.createElement("div", {className: "card small"}, 
						React.createElement("div", {className: "card-image"}, 
							React.createElement("h5", {className: "card-title"}, "Completed")
						), 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("h1", null, "40/56"), 
							React.createElement("p", null, "tasks")
						)
					)
				)
			)
		)
	},
	taskElements: function() {
		var tasks = this.props.project.tasks;
		return buildElements(tasks, function(i, t) {
			return React.createElement(Project.Tasks.Item, {task: t})
		});
	},
	titleElements: function() {
		return buildElements(this.state.titles, function(i, p) {
			return React.createElement("option", {key: p, value: p}, p)
		});
	},
});

Project.Tasks.Item = React.createClass({displayName: "Item",
	componentDidMount: function() {
		$(React.findDOMNode(this)).leanModal({
			dismissable: true,
		});
	},
	render: function() {
		var task = this.props.task;
		return (
			React.createElement("a", {href: "#view-task", className: "collection-item modal-trigger", onClick: this.handleClick}, 
				task.title
			)
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

Project.Tasks.Modal = React.createClass({displayName: "Modal",
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
			React.createElement("form", {id: this.props.id, className: "modal", onSubmit: this.handleSubmit}, 
				React.createElement("div", {className: "modal-content"}, 
					React.createElement("div", {className: "row"}, 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {id: "task-title", type: "text", className: "validate", name: "title", readOnly: readOnly}), 
							React.createElement("label", {htmlFor: "task-title", className: active}, "Title")
						), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("textarea", {id: "task-description", className: "materialize-textarea", name: "description", readOnly: readOnly}), 
							React.createElement("label", {htmlFor: "task-description", className: active}, "Description")
						), 
						React.createElement("div", {className: "input-field col s6"}, 
							React.createElement(DatePicker, {id: "task-start-date", name: "startDate", readOnly: readOnly}), 
							React.createElement("label", {htmlFor: "task-start-date", className: active}, "Start Date")
						), 
						React.createElement("div", {className: "input-field col s6"}, 
							React.createElement(DatePicker, {id: "task-end-date", name: "endDate", readOnly: readOnly}), 
							React.createElement("label", {htmlFor: "task-end-date", className: active}, "End Date")
						), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {name: "tags", ref: "tags", readOnly: readOnly})
						), 
						React.createElement("input", {name: "taskID", type: "hidden"}), 
						React.createElement("input", {name: "projectID", type: "hidden", value: project.id})
					)
				), 
				React.createElement("div", {className: "modal-footer"}, 
					
						type == "view" && !readOnly ?
						React.createElement("button", {className: "btn modal-action modal-close waves-effect waves-green left red white-text", onClick: this.handleDelete}, "Delete") :
						"", 
					
					React.createElement("button", {type: "submit", className: "btn modal-action modal-close waves-effect waves-green right blue white-text"}, "Done")
				)
			)
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

