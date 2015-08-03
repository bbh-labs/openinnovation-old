var Project = React.createClass({displayName: "Project",
	mixins: [ State, Navigation ],
	getInitialState: function() {
		return {project: null};
	},
	componentDidMount: function() {
		OI.project({projectID: this.getParams().projectID,});

		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "projectDone":
				this.setState({project: payload.data.data});
				break;
			case "projectFail":
				this.transitionTo("dashboard");
				break;
			case "createTaskDone":
			case "updateTaskDone":
			case "deleteTaskDone":
			case "toggleTaskStatusDone":
				var project = this.state.project;
				if (!project) {
					return;
				}
				OI.getProjectTasks({projectID: project.id});
				break;
			case "createTaskFail":
				Materialize.toast("Failed to create new task!", 3000, "red white-text");
				break;
			case "deleteTaskFail":
				Materialize.toast("Failed to delete existing task!", 3000, "red white-text");
				break;
			case "getProjectTasksDone":
				var project = this.state.project;
				if (!project) {
					return;
				}
				project.tasks = payload.data.data;
				this.setState({project: project});
				break;
			case "assignWorkerDone":
				OI.getTask({taskID: payload.data.data});
				break;
			case "getTaskDone":
				var project = this.state.project;
				var tasks = project.tasks;
				var task = payload.data.data;
				for (var i = 0; i < tasks.length; i++) {
					if (tasks[i].id = task.id) {
						tasks[i] = task;
						project.tasks = tasks;
						this.setState({project: project});
						break;
					}
				}
				break;
			case "createMilestoneDone":
			case "updateMilestoneDone":
			case "deleteMilestoneDone":
				var project = this.state.project;
				if (!project) {
					return;
				}
				OI.getProjectMilestones({projectID: project.id});
				break;
			case "getProjectMilestonesDone":
				var project = this.state.project;
				if (!project) {
					return;
				}
				project.milestones = payload.data.data;
				this.setState({project: project});
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var project = this.state.project;
		if (!project) {
			return React.createElement("div", null)
		}

		var user = this.props.user;
		var currentTask = this.state.currentTask;
		return (
			React.createElement("main", {className: "project"}, 
				React.createElement(Project.Cover, {user: user, project: project}), 
				React.createElement(Project.Content, {ref: "content", user: user, project: project, currentTask: currentTask})
			)
		)
	},
});

Project.Cover = React.createClass({displayName: "Cover",
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.parallax)).parallax();
	},
	render: function() {
		var project = this.props.project;
		return (
			React.createElement("div", {className: "parallax-container"}, 
				React.createElement("div", {ref: "parallax", className: "parallax"}, 
					React.createElement("img", {src: project.imageURL})
				), 
				React.createElement("div", {className: "parallax-overlay valign-wrapper"}, 
					React.createElement("div", {className: "valign"}, 
						React.createElement(Project.Cover.Title, {project: project}), 
						React.createElement("h4", {className: "text-center"}, project.tagline)
					)
				)
			)
		)
	},
});

Project.Cover.Title = React.createClass({displayName: "Title",
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.title));
	},
	render: function() {
		var project = this.props.project;
		return React.createElement("h1", {className: "text-center"}, project.title)
	},
});

Project.Content = React.createClass({displayName: "Content",
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.tabs)).tabs();
	},
	render: function() {
		var user = this.props.user;
		var project = this.props.project;
		var currentTask = this.props.currentTask;
		return (
			React.createElement("div", {className: "row container"}, 
				React.createElement("div", {className: "col s12"}, 
					React.createElement("ul", {className: "tabs", ref: "tabs"}, 
						React.createElement("li", {className: "tab col s3"}, React.createElement("a", {href: "#project-overview"}, "Overview")), 
						React.createElement("li", {className: "tab col s3"}, React.createElement("a", {href: "#project-tasks"}, "Tasks")), 
						React.createElement("li", {className: "tab col s3"}, React.createElement("a", {href: "#project-milestones"}, "Milestones")), 
						React.createElement("li", {className: "tab col s3"}, React.createElement("a", {href: "#project-members"}, "Members"))
					)
				), 
				React.createElement(Project.Overview, {user: user, project: project}), 
				React.createElement(Project.Tasks, {user: user, project: project, currentTask: currentTask}), 
				React.createElement(Project.Milestones, {user: user, project: project}), 
				React.createElement(Project.Members, {user: user, project: project})
			)
		)
	},
});
