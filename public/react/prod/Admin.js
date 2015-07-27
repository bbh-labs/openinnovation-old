var Admin = React.createClass({displayName: "Admin",
	render: function() {
		return (
			React.createElement("div", {className: "admin"}, 
				React.createElement(Header, null), 
				React.createElement("main", null, 
					React.createElement(Admin.Content, null)
				), 
				React.createElement(Footer, null)
			)
		)
	},
});

Admin.Content = React.createClass({displayName: "Content",
	componentDidMount: function() {
		dispatcher.register(function(payload) {
			switch (payload.type) {
			case "featuredProjectsDone":
				this.setState({projects: payload.data}); break;
			}
		}.bind(this));

		OI.featuredProjects({
			count: 10,
		});
	},
	render: function() {
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement("div", {className: "featured-projects"}, 
					React.createElement("ul", {className: "collection"}, 
						this.featuredProjectElements()
					)
				)
			)
		)
	},
	featuredProjectElements: function() {
		return buildElements(this.state.projects, function(i, el) {
			return (
				React.createElement("li", {className: "collection-item"}, el.title)
			)
		});
	},
});
