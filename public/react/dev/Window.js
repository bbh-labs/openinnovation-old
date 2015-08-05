var Window = React.createClass({
	styles: {
		container: {
			display: "flex",
			flexDirection: "column",
			background: "#fcfcfc",
		},
	},
	componentDidMount: function() {
		$(React.findDOMNode(this))
			.draggable({stack: ".window", cursor: "move"})
			.resizable();
	},
	render: function() {
		return (
			<div className={classNames(this.props.className, "window z-depth-2")} style={m(this.styles.container, this.props.style)}>
				{this.props.children}
			</div>
		)
	},
});

Window.Header = React.createClass({
	styles: {
		container: {
			flex: "0 36px",
		},
		title: {
			float: "left",
			cursor: "default",
			margin: "8px",
		},
		icons: {
			float: "right",
			margin: "8px",
		},
	},
	render: function() {
		return (
			<div className={classNames("materialize-red white-text", this.props.className)} style={m(this.styles.container, this.props.style)}>
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
		if (this.props.onClose) {
			this.props.onClose();
		}
		e.preventDefault();
	},
});

Window.Content = React.createClass({
	styles: {
		container: {
			flex: "1 auto",
		},
	},
	render: function() {
		return (
			<div style={m(this.styles.container, this.props.style)}>
				{this.props.children}
			</div>
		)
	},
});

Window.Footer = React.createClass({
	styles: {
		container: {
			flex: "0 36px",
		},
	},
	render: function() {
		return (
			<div style={this.styles.container}>
			</div>
		)
	},
});
