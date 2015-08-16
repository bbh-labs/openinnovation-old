var TaskItem = React.createClass({displayName: "TaskItem",
	getInitialState: function() {
		return {hovering: false};
	},
	render: function() {
		var task = this.props.task;
		var workers = task.workers;
		return (
			React.createElement("li", {className: "collection-item", onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave}, 
				React.createElement(Link, {to: "task", params: {task: task.id, projectID: task.projectID}, onClick: this.handleClick}, 
					task.title
				), 
				React.createElement("div", {className: "secondary-content"}, 
				
					workers ? workers.map(function(w) {
						return React.createElement(Project.Tasks.Worker, {key: w.id, worker: w})
					}) : "", 
				
					React.createElement("i", {style: {cursor: "pointer", visibility: this.state.hovering || task.done ? "visible" : "hidden"}, 
						onClick: this.handleToggleStatus, 
						className: classNames("material-icons", task.done && "green-text")}, "done")
				)
			)
		)
	},
	handleToggleStatus: function(e) {
		var task = this.props.task;
		OI.toggleTaskStatus({
			projectID: task.projectID,
			taskID: task.id
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
