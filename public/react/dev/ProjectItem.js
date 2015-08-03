var ProjectItem = React.createClass({
	render: function() {
		var p = this.props.project;
		return (
			<Link to="project" params={{projectID: p.id}}>
				<img className="responsive-img" src={p.imageURL} />
			</Link>
		)
	},
});
