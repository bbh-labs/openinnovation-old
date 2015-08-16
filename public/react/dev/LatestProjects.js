var LatestProjects = React.createClass({
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
				Materialize.toast("Failed to get latest projects", 1000, "red white-text");
				break;
			}
		}.bind(this));

		OI.latestProjects({count: 9});
	},
	componentDidUpdate: function() {
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
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var projects = this.state.projects;
		return (
			<div className="latest-projects card">
				<div className="card-content">
					<h5>Latest Projects</h5>
					<div ref="slides">{
						projects ? projects.map(function(p) {
							return <ProjectItem key={p.id} project={p} />
						}) : ""
					}</div>
				</div>
				<div className="card-action">
					<a href="#" className="mdl-button">View More</a>
				</div>
			</div>
		)
	},
});
