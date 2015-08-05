var Window = React.createClass({displayName: "Window",
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
			React.createElement("div", {className: classNames(this.props.className, "window z-depth-1"), style: m(this.styles.container, this.props.style)}, 
				this.props.children
			)
		)
	},
});

Window.Header = React.createClass({displayName: "Header",
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
			React.createElement("div", {className: classNames("materialize-red white-text", this.props.className), style: this.styles.container}, 
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
		this.props.onClose();
		e.preventDefault();
	},
});

Window.Content = React.createClass({displayName: "Content",
	render: function() {
		return (
			React.createElement("div", null, 
				this.props.children
			)
		)
	},
});
