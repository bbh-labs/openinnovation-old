Project.Milestones = React.createClass({
	render: function() {
		var user = this.props.user;
		var project = this.props.project;
		return (
			<div id="project-milestones" className="col s12">
				<div className="main col s12">
					<section id="cd-timeline" className="cd-container">
					{
						project.milestones ?
						project.milestones.map(function(m) {
							return <Project.Milestones.Item type="view" key={m.id} milestone={m} isAuthor={project.author.id == user.id} />
						}) : ""
					}
						<button className="btn waves-effect waves-light" ref="createMilestone" onClick={this.handleClick}>Add Milestone</button>
					</section>
				</div>
				<Project.Milestones.Modal id="view-milestone" project={project} type="view" />
				<Project.Milestones.Modal id="create-milestone" project={project} type="create" />
			</div>
		)
	},
	handleClick: function(e) {
		dispatcher.dispatch({
			type: "createMilestone",
		});

		e.preventDefault();
	},
});

Project.Milestones.Item = React.createClass({
	getInitialState: function() {
		return {hovering: false};
	},
	render: function() {
		var milestone = this.props.milestone;
		var isAuthor = this.props.isAuthor;
		var showButton = isAuthor && this.state.hovering;
		var isAfter = moment().isAfter(milestone.dateStr);
		return (
			<div className="cd-timeline-block" onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}>
				<div className="cd-timeline-img cd-movie" style={{background: isAfter ? "#00ff00" : "#ff0000"}}>
					<i className="material-icons">{isAfter ? "done" : "clear"}</i>
				</div>
				<div className="cd-timeline-content">
					<h2>{milestone.title}</h2>
					<p>{milestone.description}</p>
					<span className="cd-date">{milestone.dateStr}</span>
					<button className="btn waves-effect waves-light grey darken-2"
							style={{border: "none", visibility: showButton ? "visible" : "hidden"}}
							onClick={this.handleClick}>
						Edit
					</button>
				</div>
			</div>
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

Project.Milestones.Modal = React.createClass({
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
			<form id={this.props.id} className="modal" onSubmit={this.handleSubmit}>
				<div className="modal-content">
					<div className="row">
						<div className="input-field col s12">
							<input id="milestone-title" type="text" className="validate" name="title" readOnly={readOnly} />
							<label htmlFor="milestone-title" className={active}>Title</label>
						</div>
						<div className="input-field col s12">
							<textarea id="milestone-description" className="materialize-textarea" name="description" readOnly={readOnly}></textarea>
							<label htmlFor="milestone-description" className={active}>Description</label>
						</div>
						<div className="input-field col s6">
							<DatePicker id="milestone-date" name="date" readOnly={readOnly} ref="date" />
							<label htmlFor="milestone-date" className={active}>Date</label>
						</div>
						<input name="milestoneID" type="hidden" />
						<input name="projectID" type="hidden" value={project.id} />
					</div>
				</div>
				<div className="modal-footer">
					{
						type == "view" && !readOnly ?
						<button className="btn modal-action modal-close waves-effect waves-green left red white-text" onClick={this.handleDelete}>Delete</button> : ""
					}
					<button type="submit" className="btn modal-action modal-close waves-effect waves-green right blue white-text">Done</button>
				</div>
			</form>
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
