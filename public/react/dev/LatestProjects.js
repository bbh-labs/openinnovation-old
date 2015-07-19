var LatestProjects = React.createClass({
	componentDidMount: function() {
		var slides = React.findDOMNode(this.refs.slides);
		$(slides).owlCarousel({
			loop: true,
			autoplay: true,
			responsive: {
				0: {
					items: 1,
				},
				600: {
					items: 2,
				},
				1000: {
					items: 3,
				},
				2000: {
					items: 4,
				},
			},
		});
	},
	render: function() {
		return (
			<div className="latest-projects card">
				<div className="card-content">
					<h5>Latest Projects</h5>
					<div ref="slides">
						{this.projectElements()}
					</div>
				</div>
				<div className="card-action">
					<a href="#" className="mdl-button">View More</a>
				</div>
			</div>
		)
	},
	projectElements: function() {
		return buildElements(PROJECTS, function(i, p) {
			return <LatestProjects.Item project={p} />
		});
	},
});

LatestProjects.Item = React.createClass({
	render: function() {
		var p = this.props.project;
		return (
			<img src={p.imageURL} />
		)
	},
});
