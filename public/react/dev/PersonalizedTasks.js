var PersonalizedTasks = React.createClass({
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
		var task = this.state.task;
		return (
			<div className="tasks-of-the-day card">
				<div className="card-content">
					<h5>Personalized Tasks</h5>
					<ul className="collection">{
						state.tasks ?
						state.tasks.map(function(t) {
							return <TaskItem key={t.id} task={t} />
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
