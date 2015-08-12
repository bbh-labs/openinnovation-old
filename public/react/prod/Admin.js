var Admin = React.createClass({displayName: "Admin",
	render: function() {
		return (
			React.createElement("main", {className: "admin"}, 
				React.createElement(Admin.Content, null)
			)
		)
	},
});

Admin.Content = React.createClass({displayName: "Content",
	render: function() {
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement("div", {className: "container"}, 
					React.createElement("div", {className: "projects"}, 
						React.createElement(Admin.Content.LatestProjects, null)
					)
				)
			)
		)
	},
});

Admin.Content.LatestProjects = React.createClass({displayName: "LatestProjects",
	mixins: [ Navigation ],
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
				this.transitionTo("dashboard");
				break;
			}
		}.bind(this));

		OI.latestProjects({
			count: 10,
		});
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var projects = this.state.projects;
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement("h5", null, "Latest Projects"), 
				React.createElement("div", {className: "row"}, 
					React.createElement("div", {className: "input-field col s3"}, 
						React.createElement("input", {id: "latest-project-title", type: "text", onChange: this.handleChange}), 
						React.createElement("label", {htmlFor: "latest-project-title"}, "Project Title")
					)
				), 
				React.createElement("ul", {className: "collection"}, 
					projects ?
					projects.map(function(p) {
						return React.createElement("li", {className: "collection-item"}, el.title)
					}) : ""
				)
			)
		)
	},
	handleChange: function(e) {
		OI.latestProjects({
			title: e.target.value,
			count: 10,
		});

		e.preventDefault();
	},
});
