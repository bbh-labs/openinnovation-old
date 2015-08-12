var ProjectItem = React.createClass({displayName: "ProjectItem",
	styles: {
		container: {
			display: "block",
			position: "relative",
			height: "256px",
		},
		image: {
			position: "absolute",
			width: "100%",
			height: "100%",
		},
	},
	getInitialState: function() {
		return {hovering: false};
	},
	render: function() {
		var p = this.props.project;
		return (
			React.createElement(Link, {to: "project", params: {projectID: p.id}, style: this.styles.container, onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave}, 
				React.createElement("div", {className: "responsive-img", style: m(this.styles.image, {background: "url(" + p.imageURL + ") center / cover"})}), 
				React.createElement(ProjectItem.Overlay, {project: p, hovering: this.state.hovering})
			)
		)
	},
	handleMouseEnter: function(e) {
		this.setState({hovering: true});
	},
	handleMouseLeave: function(e) {
		this.setState({hovering: false});
	},
});

ProjectItem.Overlay = React.createClass({displayName: "Overlay",
	styles: {
		container: {
			position: "absolute",
			width: "100%",
			height: "100%",
			background: "rgba(0,0,0,0.0)",
			transition: "background .2s",
		},
		text: {
			color: "rgba(255,255,255,0)",
			transition: "color .2s",
			textAlign: "center",
		},
		hovering: {
			background: "rgba(0,0,0,0.5)",
		},
		hoveringText: {
			color: "rgba(255,255,255,1)",
		},
	},
	render: function() {
		var p = this.props.project;
		return (
			React.createElement("div", {className: "valign-wrapper", style: m(this.styles.container, this.props.hovering && this.styles.hovering)}, 
				React.createElement("div", {className: "valign", style: {margin: "0 auto"}}, 
					React.createElement("h5", {style: m(this.styles.text, this.props.hovering && this.styles.hoveringText)}, p.title), 
					React.createElement("p", {style: m(this.styles.text, this.props.hovering && this.styles.hoveringText)}, p.members.length, " members")
				)
			)
		)
	}
});
