Project.Tasks = React.createClass({displayName: "Tasks",
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.modalTrigger)).leanModal({
			dismissable: true,
		});
	},
	render: function() {
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
							React.createElement("option", {value: "artist"}, "Artist"), 
							React.createElement("option", {value: "copywriter"}, "Copywriter"), 
							React.createElement("option", {value: "designer"}, "Designer"), 
							React.createElement("option", {value: "programmer"}, "Programmer"), 
							React.createElement("option", {value: "manager"}, "Manager"), 
							React.createElement("option", {value: "planner"}, "Planner"), 
							React.createElement("option", {value: "producer"}, "Producer")
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
						React.createElement(Project.Tasks.Modal, {id: "create-task", readOnly: false}), 
						React.createElement(Project.Tasks.Modal, {id: "view-task", readOnly: true}), 
						React.createElement("ul", {className: "collection"}, 
							this.taskElements()
						)
					), 
					React.createElement("div", {className: "col s12"}, 
						React.createElement("button", {className: "btn waves-effect waves-light modal-trigger col s12 m4", 
								ref: "modalTrigger", 
								onClick: this.handleClick, 
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
	handleClick: function(e) {

		e.preventDefault();
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
			React.createElement("button", {"data-target": "view-task", className: "collection-item modal-trigger", onClick: this.handleClick}, 
				task.title
			)
		)
	},
	handleClick: function(e) {
		e.preventDefault();
	},
});

Project.Tasks.Modal = React.createClass({displayName: "Modal",
	componentDidMount: function() {
		var tags = React.findDOMNode(this.refs.tags);
		$(tags).tagsInput();
	},
	render: function() {
		var type = this.props.type;
		return (
			React.createElement("div", {id: this.props.id, className: "modal"}, 
				React.createElement("div", {className: "modal-content"}, 
					React.createElement("form", {className: "row", ref: "form"}, 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {id: "task-title", type: "text", className: "validate", name: "title", readOnly: this.props.readOnly}), 
							React.createElement("label", {htmlFor: "task-title"}, "Title")
						), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("textarea", {id: "task-description", className: "materialize-textarea", name: "description", readOnly: this.props.readOnly}), 
							React.createElement("label", {htmlFor: "task-description"}, "Description")
						), 
						React.createElement("div", {className: "input-field col s6"}, 
							React.createElement(DatePicker, {id: "task-start-date", name: "startDate", readOnly: this.props.readOnly}), 
							React.createElement("label", {htmlFor: "task-start-date"}, "Start Date")
						), 
						React.createElement("div", {className: "input-field col s6"}, 
							React.createElement(DatePicker, {id: "task-end-date", name: "endDate", readOnly: this.props.readOnly}), 
							React.createElement("label", {htmlFor: "task-end-date"}, "End Date")
						), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {name: "tags", ref: "tags"})
						)
					)
				), 
				React.createElement("div", {className: "modal-footer"}, 
					React.createElement("a", {href: "#", className: "modal-action modal-close waves-effect waves-green btn-flat", onClick: this.handleClick}, "Done")
				)
			)
		)
	},
	handleClick: function(e) {
		e.preventDefault();

		if (this.props.readOnly) {
			return;
		}
		
		var form = React.findDOMNode(this.refs.form);
		$(form).submit();
	},
});

