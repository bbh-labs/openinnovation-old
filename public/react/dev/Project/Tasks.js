Project.Tasks = React.createClass({
	render: function() {
		var tasks = this.props.project.tasks;
		return (
			<div id="project-tasks" className="col s12">
				<div className="main col s12">
					<div className="input-field col s12 m3 offset-m9">
						<button className="btn waves-effect waves-light modal-trigger input-button col s12"
							ref="modalTrigger"
							data-target="create-task">
							Add Task
						</button>
					</div>
					<div className="col s12">
						<h5>To Do</h5>
					</div>
					<div className="col s12">
						<ul ref="todo" className="collection task-group">{
							tasks ? tasks.map(function(t) {
								if (!t.done) {
									return <TaskItem key={t.id} task={t} />
								}
							}.bind(this)) : ""
						}</ul>
					</div>
					<div className="col s12 margin-top">
						<h5>Done</h5>
					</div>
					<div className="col s12">
						<ul ref="done" className="collection task-group">{
							tasks ? tasks.map(function(t) {
								if (t.done) {
									return <TaskItem key={t.id} task={t} />
								}
							}.bind(this)) : ""
						}</ul>
					</div>
				</div>
			</div>
		)
	},
});

Project.Tasks.Worker = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this)).tooltip({delay: 50});
	},
	render: function() {
		var worker = this.props.worker;
		return (
			<Link to="user" params={{userID: worker.id}} data-position="bottom" data-delay="50" data-tooltip={worker.fullname}>
				<img className="tooltipped" src={worker.avatarURL}/>
			</Link>
		)
	},
});
