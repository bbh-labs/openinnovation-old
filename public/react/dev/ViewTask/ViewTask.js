var ViewTask = React.createClass({
	mixins: [ Navigation, State ],
	getInitialState: function() {
		return {task: null, files: []};
	},
	componentDidMount: function() {
		// Fetch Task
		this.fetchTask();

		// Dispatch Listener
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "getTaskDone":
				var task = payload.data.data;
				if (task) {
					this.setState({task: task});
					this.refs.startDate.set("select", task.startDateStr, {format: "dd mmmm, yyyy"});
					this.refs.endDate.set("select", task.endDateStr, {format: "dd mmmm, yyyy"});
					this.fetchFiles(task.id);
				}
				break;
			case "updateTaskDone":
				Materialize.toast("Successfully updated task!", 1000);
				break;
			case "deleteTaskDone":
				var task = this.state.task;
				this.transitionTo("project", {projectID: task.projectID});
				break;
			case "googleDriveReady":
				var task = this.state.task;
				if (task) {
					this.fetchFiles(task.id);
				}
				break;
			case "getTaskFilesDone":
				this.setState({files: payload.data.data});
				break;
			case "createTaskFileDone":
				this.fetchFiles(this.taskID);
				break;
			case "deleteTaskFile":
				google.drive.deleteFile(payload.fileID, function(resp) {
					this.fetchFiles(this.taskID);
				}.bind(this));
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var task = this.state.task;
		if (!task) {
			return <div/>
		}
		var files = this.state.files;
		return (
			<form className="row" id={this.props.id} onSubmit={this.handleSubmit}>
				<div className="container">
					<div className="input-field col s12">
						<input id="task-title" type="text" className="validate" name="title" defaultValue={task.title} />
						<label htmlFor="task-title" className="active">Title</label>
					</div>
					<div className="input-field col s12">
						<textarea id="task-description" className="materialize-textarea" name="description" defaultValue={task.description}></textarea>
						<label htmlFor="task-description" className="active">Description</label>
					</div>
					<div className="input-field col s6">
						<DatePicker id="task-start-date" name="startDate" ref="startDate" />
						<label htmlFor="task-start-date" className="active">Start Date</label>
					</div>
					<div className="input-field col s6">
						<DatePicker id="task-end-date" name="endDate" ref="endDate" />
						<label htmlFor="task-end-date" className="active">End Date</label>
					</div>
					<div className="input-field col s12">
						<TagIt ref="tags" onChange={this.handleTagsChange} />
					</div>
					<div className="input-field col s12">
						<p>Files</p>
						<ul className="collection">{
							files ? files.map(function(f) {
								return <Task.FileItem key={f.id} file={f} />
							}) : ""
						}</ul>
						<input type="file" name="file" onChange={this.handleFileInput} />
					</div>
					<div className="col s12 margin-top">
						<Link className="waves-effect waves-light btn"
							to="task_workers"
							params={{projectID: task.projectID, taskID: task.id}}>Assign Someone</Link>
					</div>
					<input type="hidden" ref="tagsInput" />
					<input name="taskID" type="hidden" defaultValue={task.id} />
					<input name="projectID" type="hidden" defaultValue={task.projectID} />
					<div className="input-field col s12">
						<div className="left">
							<button className="btn waves-effect waves-light red white-text"
								onClick={this.handleDelete}>Delete</button>
						</div>
						<div className="right">
							<Link className="btn waves-effect waves-green"
								params={{projectID: task.projectID}}
								to="project">Back to Project</Link>
							<button type="submit" className="btn waves-effect waves-green blue white-text">Done</button>
						</div>
					</div>
				</div>
			</form>
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();
		OI.updateTask($(e.target).serialize());
	},
	handleDelete: function(e) {
		e.preventDefault();

		var task = this.state.task;
		if (task) {
			OI.deleteTask({
				projectID: task.projectID,
				taskID: task.id,
			});
		}
	},
	handleTagsChange: function(e, ui) {
		var tags = $(e.target).tagit("assignedTags").join(",");
		React.findDOMNode(this.refs.tagsInput).value = tags;
	},
	handleFileInput: function(e) {
		var task = this.state.task;
		if (task) {
			var files = e.target.files;
			if (files && files.length > 0) {
				insertFile(files[0], function(resp) {
					this.fetchFiles(task.id);
				}.bind(this), {
					properties: [{
						key: "taskID",
						value: task.id,
						visibility: "PRIVATE",
					}],
				});
			}
		}
	},
	fetchTask: function() {
		OI.getTask({taskID: this.getParams().taskID});
	},
	fetchFiles: function(taskID) {
		var q = "properties has { key='taskID' and value='" + taskID + "' and visibility='PRIVATE' } and trashed=false";
		if (google.drive.ready) {
			google.drive.listFiles({q: q}, function(resp) {
				if (resp) {
					this.setState({files: resp});
				}
			}.bind(this), true);
		}
	},
});

CreateTask.FileItem = React.createClass({
	styles: {
		icon: {
			cursor: "pointer",
		},
	},
	getInitialState: function() {
		return {hover: false};
	},
	render: function() {
		var file = this.props.file;
		return (
			<li className="collection-item avatar" onMouseEnter={this.handleMouseOver} onMouseLeave={this.handleMouseOut}>
				<img src={file.thumbnailLink} className="circle" />
				<a href={file.webContentLink}>
					{file.title}<br/>
					{this.humanFileSize(file.fileSize)}
				</a>
				<span className="secondary-content">
					{this.state.hover ? <i className="material-icons" style={this.styles.icon} onClick={this.handleDelete}>delete</i> : ""}
				</span>
			</li>
		)
	},
	handleMouseOver: function(e) {
		this.setState({hover: true});
	},
	handleMouseOut: function(e) {
		this.setState({hover: false});
	},
	handleDelete: function(e) {
		dispatcher.dispatch({type: "deleteTaskFile", fileID: this.props.file.id});
	},
	humanFileSize: function(size) {
		var sizes = [ " bytes", "KB", "MB", "GB" ];
		var i = 0;

		while (size >= 1024 && i < sizes.length) {
			size /= 1024;
			i++;
		}

		return (size.toFixed(2)) + sizes[i];
	},
});
