Project.Tasks = React.createClass({
	render: function() {
		var project = this.props.project;
		var tasks = project.tasks;
		return (
			<div id="project-tasks" className="col s12">
				<div className="main col s12">
					<div className="input-field col s12 m3 offset-m9">
						<Link to="create-task"
							params={{projectID: project.id}}
							className="btn waves-effect waves-light col s12">Add Task</Link>
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
