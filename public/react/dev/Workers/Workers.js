var Workers = React.createClass({
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
			<div id="modal-workers" className="modal bottom-sheet">
				<div className="modal-content">
					<div className="container">
						<ul className="collection">{
							workers ? workers.map(function(m) {
								return <Project.Tasks.WorkersModal.Item
										key={m.id}
										member={m}
										isWorker={this.isWorker(m)}
										task={task} />
							}.bind(this)) : ""
						}</ul>
					</div>
				</div>
			</div>
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
