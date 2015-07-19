var Drawer = React.createClass({displayName: "Drawer",
	render: function() {
		return (
			React.createElement("div", {className: ""}, 
				React.createElement("span", {className: ""}, "BBH OI"), 
				React.createElement("nav", {className: ""}, 
					React.createElement(Link, {to: "login", className: ""}, "Create"), 
					React.createElement(Link, {to: "login", className: ""}, "Profile"), 
					React.createElement(Link, {to: "login", className: ""}, "Settings")
				)
			)
		)
	},
});
