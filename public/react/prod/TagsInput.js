var TagsInput = React.createClass({displayName: "TagsInput",
	componentDidMount: function() {
		$(React.findDOMNode(this)).tagsInput(m(this.props.option));
	},
	render: function() {
		return (
			React.createElement("input", {name: this.props.name, id: this.props.id, className: classNames(this.props.className), value: this.props.value})
		)
	},
});
