var Workers = React.createClass({displayName: "Workers",
	mixins: [ State ],
	getInitialState: function() {
		return {workers: []};
	},
	componentDidMount: function() {
		OI.getProjectMembers({projectID: this.getParams().projectID});

		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "getProjectMembersDone":
				this.setState({workers: payload.data.data});
				break;
			}
		}.bind(this));
	},
	render: function() {
		var taskID = this.getParams().taskID;
		var workers = this.props.project.workers;
		return (
			React.createElement("div", {id: "modal-workers", className: "modal bottom-sheet"}, 
				React.createElement("div", {className: "modal-content"}, 
					React.createElement("div", {className: "container"}, 
						React.createElement("ul", {className: "collection"}, 
							workers ? workers.map(function(m) {
								return React.createElement(Project.Tasks.WorkersModal.Item, {
										key: m.id, 
										member: m, 
										isWorker: this.isWorker(m), 
										task: task})
							}.bind(this)) : ""
						)
					)
				)
			)
		)
	},
	isWorker: function(member) {
		var workers = this.props.task.workers;
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
		var taskID = this.props.task.id;
		var memberID = this.props.member.id;

		OI.assignWorker({
			taskID: taskID,
			userID: memberID,
			toggle: true,
		});

		e.preventDefault();
	},
});
