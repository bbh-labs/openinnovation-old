var Admin = React.createClass({
	render: function() {
		return (
			<main className="admin">
				<Admin.Content />
			</main>
		)
	},
});

Admin.Content = React.createClass({
	render: function() {
		return (
			<div className="row">
				<div className="container">
					<div className="projects">
						<Admin.Content.LatestProjects />
					</div>
				</div>
			</div>
		)
	},
});

Admin.Content.LatestProjects = React.createClass({
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
			<div className="row">
				<h5>Latest Projects</h5>
				<div className="row">
					<div className="input-field col s3">
						<input id="latest-project-title" type="text" onChange={this.handleChange} />
						<label htmlFor="latest-project-title">Project Title</label>
					</div>
				</div>
				<ul className="collection">{
					projects ?
					projects.map(function(p) {
						return <li className="collection-item">{el.title}</li>
					}) : ""
				}</ul>
			</div>
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
