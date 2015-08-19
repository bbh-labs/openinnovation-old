var Workers = React.createClass({displayName: "Workers",
	mixins: [ State ],
	getInitialState: function() {
		return {workers: [], members: []};
	},
	componentDidMount: function() {
		var projectID = this.getParams().projectID;
		var taskID = this.getParams().taskID;

		OI.getProjectMembers({projectID: projectID});
		OI.getTaskWorkers({taskID: taskID});

		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "getTaskWorkersDone":
				this.setState({workers: payload.data.data});
				break;
			case "getProjectMembersDone":
				this.setState({members: payload.data.data});
				break;
			case "assignWorkerDone":
				OI.getProjectMembers({projectID: projectID});
				OI.getTaskWorkers({taskID: taskID});
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var projectID = this.getParams().projectID;
		var taskID = this.getParams().taskID;
		var workers = this.state.workers;
		var members = this.state.members;
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement("h5", {style: Styles.PageTitle}, "Workers"), 
				React.createElement("div", {className: "container"}, 
					React.createElement("ul", {className: "collection"}, 
						members ? members.map(function(m) {
							return React.createElement(Workers.Item, {
									key: m.id, 
									member: m, 
									isWorker: this.isWorker(m), 
									taskID: taskID})
						}.bind(this)) : ""
					), 
					React.createElement(Link, {params: {projectID: projectID, taskID: taskID}, 
						className: "btn waves-effect waves-light", 
						to: "view-task"}, "Back to Task")
				)
			)
		)
	},
	isWorker: function(member) {
		var workers = this.state.workers;
		if (!workers) {
			workers = [];
		}

		for (var i in workers) {
			if (workers[i].id == member.id) {
				return true;
			}
		}

		return false;
	},
});

Workers.Item = React.createClass({displayName: "Item",
	render: function() {
		var member = this.props.member;
		var isWorker = this.props.isWorker;
		return (
			React.createElement("li", {className: classNames("collection-item avatar pointer", isWorker && "teal white-text"), onClick: this.handleClick}, 
				React.createElement("img", {className: "circle", src: member.avatarURL}), 
				React.createElement("span", {className: "title"}, React.createElement("strong", null, member.fullname)), 
				React.createElement("p", null, member.title), 
				React.createElement(Link, {to: "user", params: {userID: member.id}, className: "secondary-content"}, 
					React.createElement("i", {className: "material-icons"}, "send")
				)
			)
		)
	},
	handleClick: function(e) {
		var taskID = this.props.taskID;
		var memberID = this.props.member.id;

		OI.assignWorker({
			taskID: taskID,
			userID: memberID,
			toggle: true,
		});

		e.preventDefault();
	},
});
