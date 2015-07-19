var Updates = React.createClass({displayName: "Updates",
	render: function() {
		return (
			React.createElement("section", {className: "section--center mdl-grid mdl-grid--no-spacing"}, 
				React.createElement("div", {className: "updates mdl-card mdl-cell mdl-cell--3-col"}, 
					React.createElement("div", {className: "mdl-card__supporting-text mdl-grid mdl-grid--no-spacing"}, 
						React.createElement("h4", {className: "mdl-cell mdl-cell--12-col"}, "Updates"), 
						React.createElement("div", {className: "category mdl-cell mdl-cell--3-col"}), 
						React.createElement("div", {className: "category mdl-cell mdl-cell--3-col"}), 
						React.createElement("div", {className: "category mdl-cell mdl-cell--3-col"}), 
						React.createElement("div", {className: "category mdl-cell mdl-cell--3-col"})
					)
				), 
				React.createElement("div", {className: "updates mdl-card mdl-cell mdl-cell--9-col"}, 
					React.createElement("div", {className: "mdl-card__supporting-text mdl-grid mdl-grid--no-spacing"}, 
						React.createElement("h4", {className: "mdl-cell mdl-cell--12-col"}, "Foobar")
					)
				)
			)
		)
	},
});
