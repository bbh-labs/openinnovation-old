var TaskItem = React.createClass({
	getInitialState: function() {
		return {hovering: false};
	},
	render: function() {
		var task = this.props.task;
		return (
			<li className="collection-item" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<a href="" onClick={this.handleClick}>
					{task.title}
				</a>
				<div className="secondary-content">
				{
					this.props.task.workers ?
					this.props.task.workers.map(function(w) {
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
	handleClick: function(e) {
		if (this.props.onTaskClicked) {
			this.props.onTaskClicked(e, this.props.task);
		}
		e.preventDefault();
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
