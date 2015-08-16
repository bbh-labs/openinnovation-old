Project.Tasks = React.createClass({displayName: "Tasks",
	render: function() {
		var project = this.props.project;
		var tasks = project.tasks;
		return (
			React.createElement("div", {id: "project-tasks", className: "col s12"}, 
				React.createElement("div", {className: "main col s12"}, 
					React.createElement("div", {className: "input-field col s12 m3 offset-m9"}, 
						React.createElement(Link, {to: "create-task", 
							params: {projectID: project.id}, 
							className: "btn waves-effect waves-light col s12"}, "Add Task")
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
