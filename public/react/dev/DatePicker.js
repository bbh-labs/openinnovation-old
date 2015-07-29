var DatePicker = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this)).pickadate({
			selectMonths: true,
			selectYears: 5,
		});
	},
	render: function() {
		return (
			<input id={this.props.id} name={this.props.name} type="date" className="datepicker" readOnly={this.props.readOnly} />
		)
	},
});
