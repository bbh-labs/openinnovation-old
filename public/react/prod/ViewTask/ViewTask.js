var ViewTask = React.createClass({displayName: "ViewTask",
	render: function() {
		return (
			React.createElement("main", null, 
				React.createElement("h5", {style: Styles.PageTitle}, "Task"), 
				React.createElement(ViewTask.Form, null)
			)
		)
	},
});

ViewTask.Form = React.createClass({displayName: "Form",
	styles: {
		container: {
			padding: "16px 0",
		},
		uploadBox: {
			position: "static",
			verticalAlign: "middle",
			cursor: "pointer",
			padding: "8px",
			border: "1px solid #bbbbbb",
		},
		icon: {
			display: "inline",
			verticalAlign: "middle",
		},
		actions: {
			marginTop: "100px",
		},
	},
	mixins: [ Navigation, State ],
	getInitialState: function() {
		return {task: null, files: [], fetchingFiles: false, uploadingFile: false};
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
				var task = this.state.task;
				this.transitionTo("project", {projectID: task.projectID});
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
			case "updateTaskFileDone":
				var task = this.state.task;
				this.fetchFiles(task.id);
				break;
			case "deleteTaskFile":
				var task = this.state.task;
				google.drive.deleteFile(payload.fileID, function(resp) {
					this.fetchFiles(task.id);
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
		var fetchingFiles = this.state.fetchingFiles;
		var uploadingFile = this.state.uploadingFile;
		return (
			React.createElement("form", {className: "row", style: this.styles.container, onSubmit: this.handleSubmit}, 
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
						uploadingFile || fetchingFiles ? React.createElement(Indeterminate, null) :"", 
						React.createElement("ul", {className: "collection"}, 
							files ? files.map(function(f) {
								return React.createElement(ViewTask.FileItem, {key: f.id, task: task, file: f})
							}) : ""
						), 
						React.createElement("label", {className: "grey lighten-2 black-text", style: this.styles.uploadBox}, 
							React.createElement("i", {className: "material-icons", style: this.styles.icon}, "attach_file"), "Attach file to task", 
							React.createElement("input", {type: "file", name: "file", onChange: this.handleUpload, style: {display: "none"}})
						)
					), 
					React.createElement("div", {className: "col s12 margin-top"}, 
						React.createElement(Link, {className: "waves-effect waves-light btn", to: "task_workers", params: {projectID: task.projectID, taskID: task.id}}, "Assign Task")
					), 
					React.createElement("input", {type: "hidden", ref: "tagsInput"}), 
					React.createElement("input", {name: "taskID", type: "hidden", defaultValue: task.id}), 
					React.createElement("input", {name: "projectID", type: "hidden", defaultValue: task.projectID}), 
					React.createElement("div", {className: "input-field col s12", style: this.styles.actions}, 
						React.createElement("div", {className: "left"}, 
							React.createElement("button", {className: "btn waves-effect waves-light red white-text", onClick: this.handleDelete}, "Delete")
						), 
						React.createElement("div", {className: "right"}, 
							React.createElement(Link, {className: "btn waves-effect waves-green", params: {projectID: task.projectID}, to: "project"}, "Back to Project"), 
							React.createElement("button", {type: "submit", className: "btn waves-effect waves-green blue white-text"}, "Done")
						)
					), 
					React.createElement(ViewTask.RevisionsModal, null)
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
	handleUpload: function(e) {
		var task = this.state.task;
		if (task) {
			var files = e.target.files;
			if (files && files.length > 0) {
				google.drive.insertFile(files[0], function(resp) {
					this.setState({uploadingFile: false});
					this.fetchFiles(task.id);
				}.bind(this), {
					properties: [{
						key: "taskID",
						value: task.id,
						visibility: "PRIVATE",
					}],
				});
			}

			this.setState({uploadingFile: true});
		}
	},
	fetchTask: function() {
		OI.getTask({taskID: this.getParams().taskID});
	},
	fetchFiles: function(taskID) {
		var q = "properties has { key='taskID' and value='" + taskID + "' and visibility='PRIVATE' } and trashed=false";

		if (google.drive.ready) {
			this.setState({fetchingFiles: true});
			google.drive.listFiles({q: q}, function(resp) {
				if (resp) {
					this.setState({files: resp});
				}
				this.setState({fetchingFiles: false});
			}.bind(this), true);
		}
	},
});

ViewTask.FileItem = React.createClass({displayName: "FileItem",
	styles: {
		icon: {
			display: "none",
			cursor: "pointer",
			paddingLeft: "8px",
		},
		label: {
			position: "static",
			color: "black",
		},
		visible: {
			display: "inline",
		}
	},
	getInitialState: function() {
		return {hover: false};
	},
	render: function() {
		var file = this.props.file;
		var actionStyle = m(this.styles.icon, this.state.hover && this.styles.visible);
		return (
			React.createElement("li", {className: "collection-item avatar", onMouseEnter: this.handleMouseOver, onMouseLeave: this.handleMouseOut}, 
				React.createElement("img", {src: file.thumbnailLink, className: "circle"}), 
				React.createElement("a", {href: file.webContentLink}, 
					file.title, " ", React.createElement("small", null, React.createElement("em", null, this.humanFileSize(file.fileSize))), React.createElement("br", null), 
					React.createElement("small", null, "Last modified ", React.createElement("strong", null, moment(file.modifiedDate).fromNow()), " by ", React.createElement("strong", null, file.lastModifyingUserName))
				), 
				React.createElement("span", {className: "secondary-content"}, 
					React.createElement("i", {className: "material-icons", style: actionStyle, title: "List Revisions", onClick: this.handleListRevisions}, "list"), 
					React.createElement("label", {style: m(actionStyle, this.styles.label), title: "Update File"}, 
						React.createElement("i", {className: "material-icons"}, 
							"file_upload", 
							React.createElement("input", {type: "file", style: {display: "none"}, onChange: this.handleFileUpdate})
						)
					), 
					React.createElement("i", {className: "material-icons", style: actionStyle, onClick: this.handleDelete, title: "Delete File"}, "delete"), 
					React.createElement("i", {className: "material-icons", style: actionStyle, onClick: this.handleShare, title: "Share File"}, "share")
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
	handleListRevisions: function(e) {
		dispatcher.dispatch({type: "showRevisionsModal", fileID: this.props.file.id});
	},
	handleFileUpdate: function(e) {
		var task = this.props.task;
		if (task) {
			var fileID = this.props.file.id;
			var files = e.target.files;
			if (files && files.length > 0) {
				google.drive.updateFile(fileID, files[0], function(resp) {
					dispatcher.dispatch({type: "updateTaskFileDone"});
				}.bind(this));
			}
		}
	},
	handleDelete: function(e) {
		dispatcher.dispatch({type: "deleteTaskFile", fileID: this.props.file.id});
	},
	handleShare: function(e) {
		google.drive.share.show([this.props.file.id]);
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

ViewTask.RevisionsModal = React.createClass({displayName: "RevisionsModal",
	fileID: 0,
	getInitialState: function() {
		return {revisions: []};
	},
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "showRevisionsModal":
				this.fileID = payload.fileID;
				this.show(this.fileID);
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var file = this.props.file;
		var revisions = this.state.revisions;
		return (
			React.createElement("div", {className: "modal"}, 
				React.createElement("div", {className: "modal-content"}, 
					React.createElement("h5", null, "Revisions"), 
					React.createElement("ul", {className: "collection"}, 
						revisions ? revisions.map(function(r, i) {
							return React.createElement(ViewTask.RevisionItem, {key: r.id, file: file, revision: r, index: i})
						}) : ""
					)
				)
			)
		)
	},
	show: function(fileID) {
		this.setState({revisions: []});
		
		google.drive.listRevisions(fileID, function(resp) {
			if (resp.items) {
				this.setState({revisions: resp.items});
			}
		}.bind(this));

		$(React.findDOMNode(this)).openModal();
	},
});

ViewTask.RevisionItem = React.createClass({displayName: "RevisionItem",
	render: function() {
		var revision = this.props.revision;
		var index = this.props.index;
		return (
			React.createElement("li", {className: "collection-item"}, 
				React.createElement("a", {href: "", onClick: this.handleDownload}, 
					"Revision ", index
				), 
				React.createElement("span", {className: "secondary-content"}, 
					"Last modified ", React.createElement("strong", null, moment(revision.modifiedDate).fromNow()), " by ", React.createElement("strong", null, revision.lastModifyingUserName), 
					React.createElement("i", {className: "material-icons", onClick: this.handleDelete}, "delete")
				)
			)
		)
	},
	handleDownload: function(e) {
		e.preventDefault();

		var revision = this.props.revision;
		google.drive.downloadFile(revision, function(resp, file) {
			var buffer = new ArrayBuffer(resp.length);
			var array = new Uint8Array(buffer);
			for (var i = 0; i < resp.length; i++) {
				array[i] = resp.charCodeAt[i];
			}

			var filename = file.title || file.originalFilename;
			var blob = new Blob([array], {type: file.mimeType});
			saveAs(blob, filename);
		});
	},
	handleDelete: function(e) {
		e.preventDefault();

		var file = this.props.file;
		var revision = this.props.revision;
		OI.deleteRevision(file.id, revision.id);
	},
});
