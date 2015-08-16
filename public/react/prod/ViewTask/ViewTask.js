var ViewTask = React.createClass({displayName: "ViewTask",
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
			return React.createElement("div", null)
		}
		var files = this.state.files;
		return (
			React.createElement("form", {className: "row", id: this.props.id, onSubmit: this.handleSubmit}, 
				React.createElement("div", {className: "container"}, 
					React.createElement("div", {className: "input-field col s12"}, 
						React.createElement("input", {id: "task-title", type: "text", className: "validate", name: "title", defaultValue: task.title}), 
						React.createElement("label", {htmlFor: "task-title", className: "active"}, "Title")
					), 
					React.createElement("div", {className: "input-field col s12"}, 
						React.createElement("textarea", {id: "task-description", className: "materialize-textarea", name: "description", defaultValue: task.description}), 
						React.createElement("label", {htmlFor: "task-description", className: "active"}, "Description")
					), 
					React.createElement("div", {className: "input-field col s6"}, 
						React.createElement(DatePicker, {id: "task-start-date", name: "startDate", ref: "startDate"}), 
						React.createElement("label", {htmlFor: "task-start-date", className: "active"}, "Start Date")
					), 
					React.createElement("div", {className: "input-field col s6"}, 
						React.createElement(DatePicker, {id: "task-end-date", name: "endDate", ref: "endDate"}), 
						React.createElement("label", {htmlFor: "task-end-date", className: "active"}, "End Date")
					), 
					React.createElement("div", {className: "input-field col s12"}, 
						React.createElement(TagIt, {ref: "tags", onChange: this.handleTagsChange})
					), 
					React.createElement("div", {className: "input-field col s12"}, 
						React.createElement("p", null, "Files"), 
						React.createElement("ul", {className: "collection"}, 
							files ? files.map(function(f) {
								return React.createElement(ViewTask.FileItem, {key: f.id, file: f})
							}) : ""
						), 
						React.createElement("input", {type: "file", name: "file", onChange: this.handleFileInput})
					), 
					React.createElement("div", {className: "col s12 margin-top"}, 
						React.createElement(Link, {className: "waves-effect waves-light btn", 
							to: "task_workers", 
							params: {projectID: task.projectID, taskID: task.id}}, "Assign Someone")
					), 
					React.createElement("input", {type: "hidden", ref: "tagsInput"}), 
					React.createElement("input", {name: "taskID", type: "hidden", defaultValue: task.id}), 
					React.createElement("input", {name: "projectID", type: "hidden", defaultValue: task.projectID}), 
					React.createElement("div", {className: "input-field col s12"}, 
						React.createElement("div", {className: "left"}, 
							React.createElement("button", {className: "btn waves-effect waves-light red white-text", 
								onClick: this.handleDelete}, "Delete")
						), 
						React.createElement("div", {className: "right"}, 
							React.createElement(Link, {className: "btn waves-effect waves-green", 
								params: {projectID: task.projectID}, 
								to: "project"}, "Back to Project"), 
							React.createElement("button", {type: "submit", className: "btn waves-effect waves-green blue white-text"}, "Done")
						)
					)
				)
			)
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
				google.drive.insertFile(files[0], function(resp) {
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

ViewTask.FileItem = React.createClass({displayName: "FileItem",
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
			React.createElement("li", {className: "collection-item avatar", onMouseEnter: this.handleMouseOver, onMouseLeave: this.handleMouseOut}, 
				React.createElement("img", {src: file.thumbnailLink, className: "circle"}), 
				React.createElement("a", {href: file.webContentLink}, 
					file.title, React.createElement("br", null), 
					this.humanFileSize(file.fileSize)
				), 
				React.createElement("span", {className: "secondary-content"}, 
					this.state.hover ? React.createElement("i", {className: "material-icons", style: this.styles.icon, onClick: this.handleDelete}, "delete") : ""
				)
			)
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
