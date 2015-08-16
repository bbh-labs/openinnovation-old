var Workers = React.createClass({
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
			<div className="row">
				<div className="container">
					<ul className="collection">{
						members ? members.map(function(m) {
							return <Workers.Item
									key={m.id}
									member={m}
									isWorker={this.isWorker(m)}
									taskID={taskID} />
						}.bind(this)) : ""
					}</ul>
					<Link params={{projectID: projectID, taskID: taskID}}
						className="btn waves-effect waves-light"
						to="view-task">Back to Task</Link>
				</div>
			</div>
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

Workers.Item = React.createClass({
	render: function() {
		var member = this.props.member;
		var isWorker = this.props.isWorker;
		return (
			<li className={classNames("collection-item avatar pointer", isWorker && "teal white-text")} onClick={this.handleClick}>
				<img className="circle" src={member.avatarURL} />
				<span className="title"><strong>{member.fullname}</strong></span>
				<p>{member.title}</p>
				<Link to="user" params={{userID: member.id}} className="secondary-content">
					<i className="material-icons">send</i>
				</Link>
			</li>
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
