var FeaturedProjects = React.createClass({displayName: "FeaturedProjects",
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
			React.createElement("div", {className: "featured-projects", ref: "featuredProjects"}, 
				this.projectElements()
			)
		)
	},
	projectElements: function() {
		return buildElements(this.state.projects, function(i, p) {
			return React.createElement(FeaturedProjects.Item, {key: p.id, project: p})
		});
	},
});

FeaturedProjects.Item = React.createClass({displayName: "Item",
	render: function() {
		var p = this.props.project;
		var style = {background: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(" + p.imageURL + ") center / cover"};
		return (
			React.createElement("div", {className: "featured-project valign-wrapper", style: style}, 
				React.createElement("div", {className: "valign"}, 
					React.createElement("h1", null, React.createElement("strong", null, p.title)), 
					React.createElement("h5", null, p.tagline), 
					React.createElement(Link, {to: "project", params: {projectID: p.id}, className: "waves-effect waves-light btn"}, "View Project")
				)
			)
		)
	},
});
