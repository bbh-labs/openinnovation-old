var ProjectItem = React.createClass({
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
			<Link to="project" params={{projectID: p.id}} style={this.styles.container} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<div className="responsive-img" style={m(this.styles.image, {background: "url(" + p.imageURL + ") center / cover"})} />
				<ProjectItem.Overlay project={p} hovering={this.state.hovering} />
			</Link>
		)
	},
	handleMouseEnter: function(e) {
		this.setState({hovering: true});
	},
	handleMouseLeave: function(e) {
		this.setState({hovering: false});
	},
});

ProjectItem.Overlay = React.createClass({
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
			<div className="valign-wrapper" style={m(this.styles.container, this.props.hovering && this.styles.hovering)}>
				<div className="valign" style={{margin: "0 auto"}}>
					<h5 style={m(this.styles.text, this.props.hovering && this.styles.hoveringText)}>{p.title}</h5>
					<p style={m(this.styles.text, this.props.hovering && this.styles.hoveringText)}>{p.members.length} members</p>
				</div>
			</div>
		)
	}
});
