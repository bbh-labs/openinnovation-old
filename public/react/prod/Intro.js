var Intro = React.createClass({displayName: "Intro",
	render: function() {
		return (
			React.createElement("div", {className: "intro"}, 
				React.createElement("header", null, 
					React.createElement("nav", {className: "row"}, 
						React.createElement("div", {className: "nav-wrapper container"}, 
							React.createElement(Link, {to: "intro", className: "brand-logo"}, "BBH OI"), 
							React.createElement("a", {href: "#", "data-activates": "mobile-menu", className: "button-collapse", ref: "mobileButton"}, React.createElement("i", {className: "material-icons"}, "menu")), 
							React.createElement("ul", {className: "right"}, 
								React.createElement("li", null, React.createElement(Link, {to: "login"}, "Login")), 
								React.createElement("li", null, React.createElement(Link, {to: "register"}, "Register"))
							), 
							React.createElement("ul", {className: "side-nav", id: "mobile-menu"}, 
								React.createElement("li", null, React.createElement(Link, {to: "login"}, "Login")), 
								React.createElement("li", null, React.createElement(Link, {to: "register"}, "Register"))
							)
						)
					)
				), 
				React.createElement("div", {className: "valign-wrapper"}, 
					React.createElement("div", {className: "valign"}, 
						React.createElement("img", {className: "img-responsive", src: "images/sheep.png", width: "25%"}), 
						React.createElement("h1", null, "OPEN INNOVATION"), 
						React.createElement("h5", null, "A platform for enabling collaboration between people with different disciplines.")
					)
				)
			)
		)
	},
});
