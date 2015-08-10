var TagsInput = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this)).tagsInput(m(this.props.option));
	},
	render: function() {
		return (
			<input name={this.props.name} id={this.props.id} className={classNames(this.props.className)} value={this.props.value} />
		)
	},
});
