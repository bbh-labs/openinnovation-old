var TagsInput = React.createClass({displayName: "TagsInput",
	componentDidMount: function() {
		$(React.findDOMNode(this)).tagsInput(m(this.props.option));
	},
	render: function() {
		return (
			React.createElement("input", {id: this.props.id, 
			       className: classNames(this.props.className), 
			       name: this.props.name, 
			       value: this.props.value, 
			       style: m(this.props.style)})
		)
	},
});
