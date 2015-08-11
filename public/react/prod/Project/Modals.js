Project.Tasks.Modal = React.createClass({displayName: "Modal",
	componentDidMount: function() {
		var tags = React.findDOMNode(this.refs.tags);
		$(tags).tagsInput();
	
		var modalTrigger = React.findDOMNode(this.refs.modalTrigger);
		$(modalTrigger).leanModal();

		var form = React.findDOMNode(this);
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "viewTask":
				if (this.props.type != "view") {
					return;
				}

				var task = payload.data;
				form.elements["taskID"].value = task.id;
				form.elements["title"].value = task.title;
				form.elements["description"].value = task.description;
				if (task.tags) {
					$(tags).importTags(task.tags.join(","));
				}

				this.refs.startDate.set("select", task.startDateStr, {format: "dd mmmm, yyyy"});
				this.refs.endDate.set("select", task.endDateStr, {format: "dd mmmm, yyyy"});

				$(form).openModal();
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
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
							React.createElement(DatePicker, {id: "task-start-date", name: "startDate", readOnly: readOnly, ref: "startDate"}), 
							React.createElement("label", {htmlFor: "task-start-date", className: active}, "Start Date")
						), 
						React.createElement("div", {className: "input-field col s6"}, 
							React.createElement(DatePicker, {id: "task-end-date", name: "endDate", readOnly: readOnly, ref: "endDate"}), 
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
			OI.createTask($(form).serialize());
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
								return React.createElement(Project.Tasks.WorkersModal.Item, {key: m.id, 
													member: m, 
													isWorker: this.isWorker(m), 
													task: task})
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

		if (!task) {
			return false;
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

Project.Milestones.Modal = React.createClass({displayName: "Modal",
	componentDidMount: function() {
		var form = React.findDOMNode(this);

		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "viewMilestone":
				if (this.props.type != "view") {
					return;
				}

				var milestone = payload.data;
				form.elements["title"].value = milestone.title;
				form.elements["description"].value = milestone.description;
				form.elements["milestoneID"].value = milestone.id;
				this.refs.date.set("select", milestone.dateStr, {format: "dd mmmm, yyyy"});

				$(form).openModal();
				break;
			case "createMilestone":
				if (this.props.type != "create") {
					return;
				}

				form.reset();
				$(form).openModal();
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
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
							React.createElement("input", {id: "milestone-title", type: "text", className: "validate", name: "title", readOnly: readOnly}), 
							React.createElement("label", {htmlFor: "milestone-title", className: active}, "Title")
						), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("textarea", {id: "milestone-description", className: "materialize-textarea", name: "description", readOnly: readOnly}), 
							React.createElement("label", {htmlFor: "milestone-description", className: active}, "Description")
						), 
						React.createElement("div", {className: "input-field col s6"}, 
							React.createElement(DatePicker, {id: "milestone-date", name: "date", readOnly: readOnly, ref: "date"}), 
							React.createElement("label", {htmlFor: "milestone-date", className: active}, "Date")
						), 
						React.createElement("input", {name: "milestoneID", type: "hidden"}), 
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
		switch (this.props.type) {
		case "view":
			OI.updateMilestone($(e.target).serialize());
			break;
		case "create":
			OI.createMilestone($(e.target).serialize());
			break;
		}
		e.preventDefault();
	},
	handleDelete: function(e) {
		var form = React.findDOMNode(this);

		switch (this.props.type) {
		case "view":
			OI.deleteMilestone($(form).serialize());
			break;
		}

		e.preventDefault();
	},
});
