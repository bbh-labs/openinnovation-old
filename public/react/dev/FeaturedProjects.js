var FeaturedProjects = React.createClass({
	getInitialState: function() {
		return {projects: []};
	},
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "latestProjectsDone":
				this.setState({projects: payload.data.data});
				break;
			case "latestProjectsFail":
				Materialize.toast("Failed to load featured projects", 3000, "red white-text");
				break;
			}
		}.bind(this));

		OI.latestProjects({count: 3});
	},
	componentDidUpdate: function() {
		var slides = React.findDOMNode(this.refs.featuredProjects);
		$(slides).owlCarousel({
			items: 1,
			autoplay: true,
		});
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		return (
			<div className="featured-projects" ref="featuredProjects">
				{this.projectElements()}
			</div>
		)
	},
	projectElements: function() {
		return buildElements(this.state.projects, function(i, p) {
			return <FeaturedProjects.Item key={p.id} project={p} />
		});
	},
});

FeaturedProjects.Item = React.createClass({
	render: function() {
		var p = this.props.project;
		var style = {background: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(" + p.imageURL + ") center / cover"};
		return (
			<div className="featured-project valign-wrapper" style={style}>
				<div className="valign">
					<h1><strong>{p.title}</strong></h1>
					<h5>{p.tagline}</h5>
					<Link to="project" params={{projectID: p.id}} className="waves-effect waves-light btn">View Project</Link>
				</div>
			</div>
		)
	},
});
