Project.Milestones = React.createClass({displayName: "Milestones",
	render: function() {
		var user = this.props.user;
		var project = this.props.project;
		return (
			React.createElement("div", {id: "project-milestones", className: "col s12"}, 
				React.createElement("div", {className: "main col s12"}, 
					React.createElement("section", {id: "cd-timeline", className: "cd-container"}, 
					
						project.milestones ?
						project.milestones.map(function(m) {
							return React.createElement(Project.Milestones.Item, {type: "view", key: m.id, milestone: m, isAuthor: project.author.id == user.id})
						}) : "", 
					
						React.createElement("button", {className: "btn waves-effect waves-light", ref: "createMilestone", onClick: this.handleClick}, "Add Milestone")
					)
				), 
				React.createElement(Project.Milestones.Modal, {id: "view-milestone", project: project, type: "view"}), 
				React.createElement(Project.Milestones.Modal, {id: "create-milestone", project: project, type: "create"})
			)
		)
	},
	handleClick: function(e) {
		dispatcher.dispatch({
			type: "createMilestone",
		});

		e.preventDefault();
	},
});

Project.Milestones.Item = React.createClass({displayName: "Item",
	getInitialState: function() {
		return {hovering: false};
	},
	render: function() {
		var milestone = this.props.milestone;
		var isAuthor = this.props.isAuthor;
		var showButton = isAuthor && this.state.hovering;
		return (
			React.createElement("div", {className: "cd-timeline-block", onMouseOver: this.handleMouseOver, onMouseOut: this.handleMouseOut}, 
				React.createElement("div", {className: "cd-timeline-img cd-movie"}, 
					React.createElement("img", {src: "vertical-timeline/img/cd-icon-movie.svg", alt: "Movie"})
				), 
				React.createElement("div", {className: "cd-timeline-content"}, 
					React.createElement("h2", null, milestone.title), 
					React.createElement("p", null, milestone.description), 
					React.createElement("span", {className: "cd-date"}, milestone.dateStr), 
					React.createElement("button", {className: "btn waves-effect waves-light grey darken-2", 
							style: {border: "none", visibility: showButton ? "visible" : "hidden"}, 
							onClick: this.handleClick}, 
						"Edit"
					)
				)
			)
		)
	},
	handleClick: function(e) {
		dispatcher.dispatch({
			type: "viewMilestone",
			data: this.props.milestone,
		});

		e.preventDefault();
	},
	handleMouseOver: function(e) {
		this.setState({hovering: true});
	},
	handleMouseOut: function(e) {
		this.setState({hovering: false});
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
