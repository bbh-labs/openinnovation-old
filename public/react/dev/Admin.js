var Admin = React.createClass({
	render: function() {
		return (
			<div className="admin">
				<Header />
				<main>
					<Admin.Content />
				</main>
				<Footer />
			</div>
		)
	},
});

Admin.Content = React.createClass({
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
			<div className="row">
				<div className="featured-projects">
					<ul className="collection">
						{this.featuredProjectElements()}
					</ul>
				</div>
			</div>
		)
	},
	featuredProjectElements: function() {
		return buildElements(this.state.projects, function(i, el) {
			return (
				<li className="collection-item">{el.title}</li>
			)
		});
	},
});
