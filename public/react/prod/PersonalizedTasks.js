var PersonalizedTasks = React.createClass({displayName: "PersonalizedTasks",
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
			React.createElement("div", {className: "tasks-of-the-day card"}, 
				React.createElement("div", {className: "card-content"}, 
					React.createElement("h5", null, "Personalized Tasks"), 
					React.createElement("ul", {className: "collection"}, 
						state.tasks ?
						state.tasks.map(function(t) {
							return React.createElement(TaskItem, {key: t.id, task: t})
						}.bind(this)) : ""
					)
				), 
				React.createElement("div", {className: "card-action"}, 
					React.createElement("a", {href: "#", className: "mdl-button"}, "View More")
				)
			)
		)
	},
	handleTaskClicked: function(e, t) {
		this.transitionTo("project", {projectID: t.projectID});
	},
});
