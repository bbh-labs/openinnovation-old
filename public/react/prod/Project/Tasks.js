Project.Tasks = React.createClass({displayName: "Tasks",
	render: function() {
		var tasks = this.props.project.tasks;
		return (
			React.createElement("div", {id: "project-tasks", className: "col s12"}, 
				React.createElement("div", {className: "main col s12"}, 
					React.createElement("div", {className: "input-field col s12 m3 offset-m9"}, 
						React.createElement("button", {className: "btn waves-effect waves-light modal-trigger input-button col s12", 
							ref: "modalTrigger", 
							"data-target": "create-task"}, 
							"Add Task"
						)
					), 
					React.createElement("div", {className: "col s12"}, 
						React.createElement("h5", null, "To Do")
					), 
					React.createElement("div", {className: "col s12"}, 
						React.createElement("ul", {ref: "todo", className: "collection task-group"}, 
							tasks ? tasks.map(function(t) {
								if (!t.done) {
									return React.createElement(TaskItem, {key: t.id, task: t})
								}
							}.bind(this)) : ""
						)
					), 
					React.createElement("div", {className: "col s12 margin-top"}, 
						React.createElement("h5", null, "Done")
					), 
					React.createElement("div", {className: "col s12"}, 
						React.createElement("ul", {ref: "done", className: "collection task-group"}, 
							tasks ? tasks.map(function(t) {
								if (t.done) {
									return React.createElement(TaskItem, {key: t.id, task: t})
								}
							}.bind(this)) : ""
						)
					)
				)
			)
		)
	},
});

Project.Tasks.Worker = React.createClass({displayName: "Worker",
	componentDidMount: function() {
		$(React.findDOMNode(this)).tooltip({delay: 50});
	},
	render: function() {
		var worker = this.props.worker;
		return (
			React.createElement(Link, {to: "user", params: {userID: worker.id}, "data-position": "bottom", "data-delay": "50", "data-tooltip": worker.fullname}, 
				React.createElement("img", {className: "tooltipped", src: worker.avatarURL})
			)
		)
	},
});
