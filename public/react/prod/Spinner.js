var Spinner = React.createClass({displayName: "Spinner",
	render: function() {
		return (
			React.createElement("div", {className: "preloader-wrapper active"}, 
				React.createElement("div", {className: "spinner-layer spinner-blue-only"}, 
					React.createElement("div", {className: "circle-clipper left"}, 
						React.createElement("div", {className: "circle"})
					), React.createElement("div", {className: "gap-patch"}, 
						React.createElement("div", {className: "circle"})
					), React.createElement("div", {className: "circle-clipper right"}, 
						React.createElement("div", {className: "circle"})
					)
				)
			)
		)
	},
});
