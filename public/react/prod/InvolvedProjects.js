var InvolvedProjects = React.createClass({displayName: "InvolvedProjects",
	getInitialState: function() {
		return {projects: []};
	},
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "getInvolvedProjectsDone":
				this.setState({projects: payload.data.data});
				break;
			case "getInvolvedProjectsFail":
				Materialize.toast(payload.data.responseText, 1000, "red white-text");
				break;
			}
		}.bind(this));

		OI.getInvolvedProjects({userID: this.props.userID});
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
			React.createElement("div", {className: "involved-projects card"}, 
				React.createElement("div", {className: "card-content"}, 
					React.createElement("h5", null, "Involved Projects"), 
					React.createElement("div", {ref: "slides"}, 
						projects ?
						projects.map(function(p) {
							return React.createElement(InvolvedProjects.Item, {key: p.id, project: p})
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

InvolvedProjects.Item = React.createClass({displayName: "Item",
	render: function() {
		var p = this.props.project;
		return (
			React.createElement("img", {className: "img-responsive", src: p.imageURL})
		)
	},
});
