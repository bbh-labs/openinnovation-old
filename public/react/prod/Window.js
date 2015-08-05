var Window = React.createClass({displayName: "Window",
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
			React.createElement("div", {className: classNames(this.props.className, "window z-depth-2"), style: m(this.styles.container, this.props.style)}, 
				this.props.children
			)
		)
	},
});

Window.Header = React.createClass({displayName: "Header",
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
			React.createElement("div", {className: classNames("materialize-red white-text", this.props.className), style: m(this.styles.container, this.props.style)}, 
				React.createElement("div", {style: this.styles.title}, 
					this.props.children
				), 
				React.createElement("div", {style: this.styles.icons}, 
					React.createElement("a", {href: "#"}, React.createElement("i", {className: "material-icons white-text", onClick: this.handleClose}, "close"))
				)
			)
		)
	},
	handleClose: function(e) {
		if (this.props.onClose) {
			this.props.onClose();
		}
		e.preventDefault();
	},
});

Window.Content = React.createClass({displayName: "Content",
	styles: {
		container: {
			flex: "1 auto",
		},
	},
	render: function() {
		return (
			React.createElement("div", {style: m(this.styles.container, this.props.style)}, 
				this.props.children
			)
		)
	},
});

Window.Footer = React.createClass({displayName: "Footer",
	styles: {
		container: {
			flex: "0 36px",
		},
	},
	render: function() {
		return (
			React.createElement("div", {style: this.styles.container}
			)
		)
	},
});
