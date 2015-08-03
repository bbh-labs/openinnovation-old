var ProjectItem = React.createClass({displayName: "ProjectItem",
	render: function() {
		var p = this.props.project;
		return (
			React.createElement(Link, {to: "project", params: {projectID: p.id}}, 
				React.createElement("img", {className: "responsive-img", src: p.imageURL})
			)
		)
	},
});
