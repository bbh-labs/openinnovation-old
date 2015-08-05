var Window = React.createClass({
	styles: {
		container: {
			background: "#fcfcfc",
		},
	},
	componentDidMount: function() {
		$(React.findDOMNode(this))
			.draggable({stack: ".window"})
			.resizable();
	},
	render: function() {
		return (
			<div className={classNames(this.props.className, "window z-depth-1")} style={m(this.styles.container, this.props.style)}>
				{this.props.children}
			</div>
		)
	},
});

Window.Header = React.createClass({
	styles: {
		container: {
			height: "36px",
			padding: "8px",
		},
		title: {
			float: "left",
			cursor: "default",
		},
		icons: {
			float: "right",
		},
	},
	render: function() {
		return (
			<div className={classNames("materialize-red white-text", this.props.className)} style={this.styles.container}>
				<div style={this.styles.title}>
					{this.props.children}
				</div>
				<div style={this.styles.icons}>
					<a href="#"><i className="material-icons white-text" onClick={this.handleClose}>close</i></a>
				</div>
			</div>
		)
	},
	handleClose: function(e) {
		this.props.onClose();
		e.preventDefault();
	},
});

Window.Content = React.createClass({
	render: function() {
		return (
			<div>
				{this.props.children}
			</div>
		)
	},
});
