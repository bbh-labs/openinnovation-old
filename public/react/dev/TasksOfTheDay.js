var TasksOfTheDay = React.createClass({
	mixins: [ Navigation ],
	getInitialState: function() {
		return {tasks: []};
	},
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "getPersonalizedTasksDone":
				this.setState({tasks: payload.data.data});
				break;
			}
		}.bind(this));

		OI.getPersonalizedTasks();
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		return (
			<div className="tasks-of-the-day card">
				<div className="card-content">
					<h4 className="">Tasks of the Day</h4>
					<ul className="collection">{
						this.state.tasks ?
						this.state.tasks.map(function(t) {
							return <TaskItem key={t.id} task={t} onTaskClicked={this.handleTaskClicked} />
						}.bind(this)) : ""
					}</ul>
				</div>
				<div className="card-action">
					<a href="#" className="mdl-button">View More</a>
				</div>
			</div>
		)
	},
	handleTaskClicked: function(e, t) {
		this.transitionTo("project", {projectID: t.projectID});
	},
});
