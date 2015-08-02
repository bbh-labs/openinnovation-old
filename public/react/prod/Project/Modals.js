Project.Tasks.Modal = React.createClass({displayName: "Modal",
	componentDidMount: function() {
		var tags = React.findDOMNode(this.refs.tags);
		$(tags).tagsInput();
	
		var modalTrigger = React.findDOMNode(this.refs.modalTrigger);
		$(modalTrigger).leanModal();
	},
	componentDidUpdate: function() {
		var clickedTask = this.props.clickedTask;
		if (clickedTask < 0) {
			return;
		}

		var tasks = this.props.project.tasks;
		var task;

		for (var i = 0; i < tasks.length; i++) {
			if (tasks[i].id == clickedTask) {
				task = tasks[i];
			}
		}
	
		var form = React.findDOMNode(this);
		form.elements["taskID"].value = task.id;
		form.elements["title"].value = task.title;
		form.elements["description"].value = task.description;
		form.elements["startDate"].value = task.startDateStr;
		form.elements["endDate"].value = task.endDateStr;
		form.elements["tags"].value = task.tags;
	},
	render: function() {
		var project = this.props.project;
		var type = this.props.type;
		var active = type == "view" ? "active" : "";
		var readOnly = !project.isMember;
		return (
			React.createElement("form", {id: this.props.id, className: "modal", onSubmit: this.handleSubmit}, 
				React.createElement("div", {className: "modal-content"}, 
					React.createElement("div", {className: "row"}, 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {id: "task-title", type: "text", className: "validate", name: "title", readOnly: readOnly}), 
							React.createElement("label", {htmlFor: "task-title", className: active}, "Title")
						), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("textarea", {id: "task-description", className: "materialize-textarea", name: "description", readOnly: readOnly}), 
							React.createElement("label", {htmlFor: "task-description", className: active}, "Description")
						), 
						React.createElement("div", {className: "input-field col s6"}, 
							React.createElement(DatePicker, {id: "task-start-date", name: "startDate", readOnly: readOnly}), 
							React.createElement("label", {htmlFor: "task-start-date", className: active}, "Start Date")
						), 
						React.createElement("div", {className: "input-field col s6"}, 
							React.createElement(DatePicker, {id: "task-end-date", name: "endDate", readOnly: readOnly}), 
							React.createElement("label", {htmlFor: "task-end-date", className: active}, "End Date")
						), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {name: "tags", ref: "tags", readOnly: readOnly})
						), 
						React.createElement("div", {className: "col s12 margin-top"}, 
							React.createElement("a", {className: "waves-effect waves-light btn modal-trigger", href: "#modal-workers", ref: "modalTrigger"}, "Assign Someone")
						), 
						React.createElement("input", {name: "taskID", type: "hidden"}), 
						React.createElement("input", {name: "projectID", type: "hidden", value: project.id})
					)
				), 
				React.createElement("div", {className: "modal-footer"}, 
					
						type == "view" && !readOnly ?
						React.createElement("button", {className: "btn modal-action modal-close waves-effect waves-green left red white-text", onClick: this.handleDelete}, "Delete") : "", 
					
					React.createElement("button", {type: "submit", className: "btn modal-action modal-close waves-effect waves-green right blue white-text"}, "Done")
				)
			)
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();

		if (this.props.readOnly) {
			return;
		}

		var form = React.findDOMNode(this);
		var type = this.props.type;
		if (type == "create") {
			OI.newTask($(form).serialize());
		} else if (type == "view") {
			OI.updateTask($(form).serialize());
		}
	},
	handleDelete: function(e) {
		e.preventDefault();

		if (this.props.readOnly) {
			return;
		}

		var form = React.findDOMNode(this);
		OI.deleteTask({
			projectID: form.elements["projectID"].value,
			taskID: form.elements["taskID"].value,
		});
	},
});

Project.Tasks.WorkersModal = React.createClass({displayName: "WorkersModal",
	render: function() {
		var clickedTask = this.props.clickedTask;
		if (clickedTask < 0) {
			return React.createElement("div", null)
		}

		var tasks = this.props.project.tasks;
		var task;
		for (var i = 0; i < tasks.length; i++) {
			if (tasks[i].id == clickedTask) {
				task = tasks[i];
			}
		}

		return (
			React.createElement("div", {id: "modal-workers", className: "modal bottom-sheet"}, 
				React.createElement("div", {className: "modal-content"}, 
					React.createElement("div", {className: "container"}, 
						React.createElement("ul", {className: "collection"}, 
							this.props.project.members.map(function(m) {
								return React.createElement(Project.Tasks.WorkersModal.Item, {key: m.id, member: m, isWorker: this.isWorker(m), task: task})
							}.bind(this))
						)
					)
				)
			)
		)
	},
	isWorker: function(member) {
		var clickedTask = this.props.clickedTask;
		if (clickedTask < 0) {
			return false;
		}

		var tasks = this.props.project.tasks;
		var task;
		for (var i = 0; i < tasks.length; i++) {
			if (tasks[i].id == clickedTask) {
				task = tasks[i];
			}
		}

		var workers = task.workers;
		if (!workers) {
			workers = [];
		}

		for (var i = 0; i < workers.length; i++) {
			if (workers[i].id == member.id) {
				return true;
			}
		}

		return false;
	},
});

Project.Tasks.WorkersModal.Item = React.createClass({displayName: "Item",
	render: function() {
		var member = this.props.member;
		var isWorker = this.props.isWorker;
		return (
			React.createElement("li", {className: classNames("collection-item avatar pointer", isWorker && "teal white-text"), onClick: this.handleClick}, 
				React.createElement("img", {className: "circle", src: "images/profile-pics/1.jpg"}), 
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
