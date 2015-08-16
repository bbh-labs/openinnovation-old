var LatestProjects = React.createClass({displayName: "LatestProjects",
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
			React.createElement("div", {className: "latest-projects card"}, 
				React.createElement("div", {className: "card-content"}, 
					React.createElement("h5", null, "Latest Projects"), 
					React.createElement("div", {ref: "slides"}, 
						projects ? projects.map(function(p) {
							return React.createElement(ProjectItem, {key: p.id, project: p})
						}) : ""
					)
				), 
				React.createElement("div", {className: "card-action"}, 
					React.createElement("a", {href: "#", className: "mdl-button"}, "View More")
				)
			)
		)
	},
});
