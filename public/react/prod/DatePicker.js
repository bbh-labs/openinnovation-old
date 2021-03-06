var DatePicker = React.createClass({displayName: "DatePicker",
	componentDidMount: function() {
		$(React.findDOMNode(this)).pickadate({
			selectMonths: true,
			selectYears: 5,
		});
	},
	render: function() {
		return (
			React.createElement("input", {id: this.props.id, name: this.props.name, type: "date", className: "datepicker", readOnly: this.props.readOnly})
		)
	},
	set: function(cmd, value, format) {
		var picker = $(React.findDOMNode(this)).pickadate("picker");
		picker.set(cmd, value, format);
	},
});
