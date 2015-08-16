var CreateTask = React.createClass({
	mixins: [ State ],
	getInitialState: function() {
		return {task: null, files: []};
	},
	componentDidMount: function() {
		// Initialize Task Dates
		this.refs.startDate.set("select", task.startDateStr, {format: "dd mmmm, yyyy"});
		this.refs.endDate.set("select", task.endDateStr, {format: "dd mmmm, yyyy"});

		// Fetch Task
		this.fetchTask();

		// Dispatch Listener
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "getTaskDone":
				var task = payload.data.data;
				if (task) {
					this.setState({task: task});
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
				deleteFile(payload.fileID, function(resp) {
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
		var files = this.state.files;
		var task = this.state.task;
		return (
			<form id={this.props.id} onSubmit={this.handleSubmit}>
				<div className="modal-content">
					<div className="row">
						<div className="input-field col s12">
							<input id="task-title" type="text" className="validate" name="title" />
							<label htmlFor="task-title">Title</label>
						</div>
						<div className="input-field col s12">
							<textarea id="task-description" className="materialize-textarea" name="description"></textarea>
							<label htmlFor="task-description">Description</label>
						</div>
						<div className="input-field col s6">
							<DatePicker id="task-start-date" name="startDate" ref="startDate" />
							<label htmlFor="task-start-date">Start Date</label>
						</div>
						<div className="input-field col s6">
							<DatePicker id="task-end-date" name="endDate" ref="endDate" />
							<label htmlFor="task-end-date">End Date</label>
						</div>
						<div className="input-field col s12">
							<TagIt ref="tags" onChange={this.handleTagsChange} />
						</div>
						<div className="input-field col s12">
							<p>Files</p>
							<ul className="collection">
							{
								files ? files.map(function(f) {
									return <Task.FileItem key={f.id} file={f} />
								}) : ""
							}
							</ul>
							<input type="file" name="file" onChange={this.handleFileInput} />
						</div>
						<input type="hidden" ref="tagsInput" />
						<input name="taskID" type="hidden" />
						<input name="projectID" type="hidden" value={task.projectID} />
					</div>
				</div>
				<div className="input-field col s12">
					<button type="submit" className="btn modal-action modal-close waves-effect waves-green right blue white-text">Done</button>
				</div>
			</form>
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();
		OI.createTask($(form).serialize());
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
		listFiles({q: q}, function(resp) {
			if (resp) {
				this.setState({files: resp});
			}
		}.bind(this), true);
	},
});

