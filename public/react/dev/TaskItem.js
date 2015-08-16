var TaskItem = React.createClass({
	getInitialState: function() {
		return {hovering: false};
	},
	render: function() {
		var task = this.props.task;
		var workers = task.workers;
		return (
			<li className="collection-item" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<Link to="task" params={{task: task.id, projectID: task.projectID}} onClick={this.handleClick}>
					{task.title}
				</Link>
				<div className="secondary-content">
				{
					workers ? workers.map(function(w) {
						return <Project.Tasks.Worker key={w.id} worker={w} />
					}) : ""
				}
					<i style={{cursor: "pointer", visibility: this.state.hovering || task.done ? "visible" : "hidden"}}
						onClick={this.handleToggleStatus}
						className={classNames("material-icons", task.done && "green-text")}>done</i>
				</div>
			</li>
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
