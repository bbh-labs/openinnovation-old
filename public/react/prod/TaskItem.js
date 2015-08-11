var TaskItem = React.createClass({displayName: "TaskItem",
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
		if (this.props.onTaskClicked) {
			this.props.onTaskClicked(e, this.props.task);
		}
	},
	handleToggleStatus: function(e) {
		OI.toggleTaskStatus({
			projectID: this.props.task.projectID,
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
