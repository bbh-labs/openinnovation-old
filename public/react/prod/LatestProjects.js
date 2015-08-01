var LatestProjects = React.createClass({displayName: "LatestProjects",
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
			React.createElement("div", {className: "latest-projects card"}, 
				React.createElement("div", {className: "card-content"}, 
					React.createElement("h5", null, "Latest Projects"), 
					React.createElement("div", {ref: "slides"}, 
						this.projectElements()
					)
				), 
				React.createElement("div", {className: "card-action"}, 
					React.createElement("a", {href: "#", className: "mdl-button"}, "View More")
				)
			)
		)
	},
	projectElements: function() {
		return buildElements(PROJECTS, function(i, p) {
			return React.createElement(LatestProjects.Item, {key: p.id, project: p})
		});
	},
});

LatestProjects.Item = React.createClass({displayName: "Item",
	render: function() {
		var p = this.props.project;
		return (
			React.createElement("img", {src: p.imageURL})
		)
	},
});
