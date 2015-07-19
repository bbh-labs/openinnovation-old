var FeaturedProjects = React.createClass({displayName: "FeaturedProjects",
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
			React.createElement("div", {className: "featured-projects", ref: "featuredProjects"}, 
				this.projectElements()
			)
		)
	},
	projectElements: function() {
		return buildElements(PROJECTS, function(i, p) {
			return React.createElement(FeaturedProjects.Item, {project: p})
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
					React.createElement("h1", null, React.createElement("strong", null, p.name)), 
					React.createElement("h5", null, p.tagline), 
					React.createElement(Link, {to: "project", className: "waves-effect waves-light btn"}, "View Project")
				)
			)
		)
	},
});
