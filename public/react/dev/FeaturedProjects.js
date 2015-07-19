var FeaturedProjects = React.createClass({
	componentDidMount: function() {
		var slides = React.findDOMNode(this.refs.featuredProjects);
		$(slides).owlCarousel({
			items: 1,
			loop: true,
			autoplay: true,
		});
	},
	render: function() {
		return (
			<div className="featured-projects" ref="featuredProjects">
				{this.projectElements()}
			</div>
		)
	},
	projectElements: function() {
		return buildElements(PROJECTS, function(i, p) {
			return <FeaturedProjects.Item project={p} />
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
					<h1><strong>{p.name}</strong></h1>
					<h5>{p.tagline}</h5>
					<Link to="project" className="waves-effect waves-light btn">View Project</Link>
				</div>
			</div>
		)
	},
});
