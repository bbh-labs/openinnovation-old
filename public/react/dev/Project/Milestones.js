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
		return (
			<div className="cd-timeline-block" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<div className="cd-timeline-img cd-movie">
					<img src="vertical-timeline/img/cd-icon-movie.svg" alt="Movie" />
				</div>
				<div className="cd-timeline-content">
					<h2>{milestone.title}</h2>
					<p>{milestone.description}</p>
					<span className="cd-date">{milestone.dateStr}</span>
					<button className="btn waves-effect waves-light grey"
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
	handleMouseEnter: function(e) {
		this.setState({hovering: true});
	},
	handleMouseLeave: function(e) {
		this.setState({hovering: false});
	},
});
