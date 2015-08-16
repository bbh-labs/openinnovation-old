var TaskItem = React.createClass({
	getInitialState: function() {
		return {hovering: false};
	},
	render: function() {
		var task = this.props.task;
		var workers = task.workers;
		return (
			<li className="collection-item" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<Link to="view-task" params={{projectID: task.projectID, taskID: task.id}} onClick={this.handleClick}>
					{task.title}
				</Link>
				<div className="secondary-content">
				{
					workers ? workers.map(function(w) {
						return <TaskItem.Worker key={w.id} worker={w} />
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
			return <TaskItem.Worker worker={w} />
		});
	},
	doneElement: function(e) {
		var task = this.props.task;
		return <i style={{cursor: "pointer", visibility: this.state.hovering || task.done ? "visible" : "hidden"}}
			  onClick={this.handleToggleStatus}
			  className={classNames("material-icons", task.done && "green-text")}>done</i>
	},
});

TaskItem.Worker = React.createClass({
	styles: {
		image: {
			borderRadius: "50%",
			width: "32px",
			height: "32px",
			margin: "0 4px",
		},
	},
	componentDidMount: function() {
		$(React.findDOMNode(this)).tooltip({delay: 50});
	},
	render: function() {
		var worker = this.props.worker;
		return (
			<Link to="user" params={{userID: worker.id}} data-position="bottom" data-delay="50" data-tooltip={worker.fullname}>
				<img className="tooltipped" src={worker.avatarURL} style={this.styles.image} />
			</Link>
		)
	},
});
