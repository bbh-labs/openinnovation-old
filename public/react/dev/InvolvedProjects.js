var InvolvedProjects = React.createClass({
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
			<div className="involved-projects card">
				<div className="card-content">
					<h5>Involved Projects</h5>
					<div ref="slides">{
						projects ?
						projects.map(function(p) {
							return <InvolvedProjects.Item key={p.id} project={p} />
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

InvolvedProjects.Item = React.createClass({
	render: function() {
		var p = this.props.project;
		return (
			<img className="img-responsive" src={p.imageURL} />
		)
	},
});
