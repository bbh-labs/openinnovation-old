var Indeterminate = React.createClass({displayName: "Indeterminate",
	render: function() {
		return (
			React.createElement("div", {className: "progress"}, 
				React.createElement("div", {className: "indeterminate"})
			)
		)
	},
});
