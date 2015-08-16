var CreateTask = React.createClass({displayName: "CreateTask",
	mixins: [ Navigation, State ],
	componentDidMount: function() {
		var projectID = this.getParams().projectID;
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "createTaskDone":
				this.transitionTo("project", {projectID: projectID});
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var projectID = this.getParams().projectID;
		return (
			React.createElement("form", {className: "row", id: this.props.id, onSubmit: this.handleSubmit}, 
				React.createElement("div", {className: "container"}, 
					React.createElement("div", {className: "input-field col s12"}, 
						React.createElement("input", {id: "task-title", type: "text", className: "validate", name: "title"}), 
						React.createElement("label", {htmlFor: "task-title"}, "Title")
					), 
					React.createElement("div", {className: "input-field col s12"}, 
						React.createElement("textarea", {id: "task-description", className: "materialize-textarea", name: "description"}), 
						React.createElement("label", {htmlFor: "task-description"}, "Description")
					), 
					React.createElement("div", {className: "input-field col s6"}, 
						React.createElement(DatePicker, {id: "task-start-date", name: "startDate", ref: "startDate"}), 
						React.createElement("label", {htmlFor: "task-start-date"}, "Start Date")
					), 
					React.createElement("div", {className: "input-field col s6"}, 
						React.createElement(DatePicker, {id: "task-end-date", name: "endDate", ref: "endDate"}), 
						React.createElement("label", {htmlFor: "task-end-date"}, "End Date")
					), 
					React.createElement("div", {className: "input-field col s12"}, 
						React.createElement(TagIt, {ref: "tags", onChange: this.handleTagsChange})
					), 
					React.createElement("input", {type: "hidden", ref: "tagsInput"}), 
					React.createElement("input", {name: "projectID", type: "hidden", value: projectID}), 
					React.createElement("div", {className: "input-field col s12"}, 
						React.createElement("div", {className: "right"}, 
							React.createElement(Link, {className: "btn waves-effect waves-green", 
								params: {projectID: projectID}, 
								to: "project"}, "Back to Project"), 
							React.createElement("button", {className: "btn waves-effect waves-green blue white-text", 
								type: "submit"}, "Done")
						)
					)
				)
			)
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();
		OI.createTask($(e.target).serialize());
	},
	handleTagsChange: function(e, ui) {
		var tags = $(e.target).tagit("assignedTags").join(",");
		React.findDOMNode(this.refs.tagsInput).value = tags;
	},
});

