Project.Milestones = React.createClass({displayName: "Milestones",
	componentDidMount: function() {
		var createMilestone = React.findDOMNode(this.refs.createMilestone);
		$(createMilestone).leanModal({dismissable: true});
	},
	render: function() {
		var user = this.props.user;
		var project = this.props.project;
		return (
			React.createElement("div", {id: "project-milestones", className: "col s12"}, 
				React.createElement("div", {className: "main col s12"}, 
					React.createElement("section", {id: "cd-timeline", className: "cd-container"}, 
					
						project.milestones ?
						project.milestones.map(function(m) {
							return React.createElement(Project.Milestones.Item, {key: m.id, milestone: m, isAuthor: project.author.id == user.id})
						}) : "", 
					
						React.createElement("button", {"data-target": "create-milestone", className: "btn waves-effect waves-light", ref: "createMilestone"}, "Add Milestone")
					)
				), 
				React.createElement(Project.Milestones.Modal, {id: "view-milestone", project: project, type: "view"}), 
				React.createElement(Project.Milestones.Modal, {id: "create-milestone", project: project, type: "create"})
			)
		)
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
			React.createElement("div", {className: "cd-timeline-block", onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave}, 
				React.createElement("div", {className: "cd-timeline-img cd-movie"}, 
					React.createElement("img", {src: "vertical-timeline/img/cd-icon-movie.svg", alt: "Movie"})
				), 
				React.createElement("div", {className: "cd-timeline-content"}, 
					React.createElement("h2", null, milestone.title), 
					React.createElement("p", null, milestone.description), 
					React.createElement("span", {className: "cd-date"}, milestone.dateStr), 
					React.createElement("button", {className: "btn waves-effect waves-light grey", 
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
	handleMouseEnter: function(e) {
		this.setState({hovering: true});
	},
	handleMouseLeave: function(e) {
		this.setState({hovering: false});
	},
});
