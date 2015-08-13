var Header = React.createClass({displayName: "Header",
	mixins: [ Navigation ],
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.mobileButton)).sideNav();
	},
	render: function() {
		var user = this.props.user;
		return (
			React.createElement("header", null, 
				React.createElement("nav", {className: "row"}, 
					React.createElement("div", {className: "nav-wrapper container"}, 
						React.createElement(Link, {to: "dashboard", className: "brand-logo"}, "BBH OI"), 
						React.createElement("a", {href: "#", "data-activates": "mobile-menu", className: "button-collapse", ref: "mobileButton"}, 
							React.createElement("i", {className: "material-icons"}, "menu")
						), 
						React.createElement("ul", {className: "right hide-on-med-and-down"}, 
							React.createElement("li", null, React.createElement(Link, {to: "new-project"}, React.createElement("i", {className: "material-icons"}, "create"))), 
							React.createElement("li", null, React.createElement(Link, {to: "user", params: {userID: user.id}}, React.createElement("i", {className: "material-icons"}, "person"))), 
							React.createElement("li", null, React.createElement("a", {href: "#", onClick: this.handleLogout}, React.createElement("i", {className: "material-icons"}, "input")))
						), 
						React.createElement("ul", {id: "mobile-menu", className: "side-nav"}, 
							React.createElement("li", null, React.createElement(Link, {to: "new-project"}, "New Project")), 
							React.createElement("li", null, React.createElement(Link, {to: "user", params: {userID: user.id}}, "Profile")), 
							React.createElement("li", null, React.createElement("a", {href: "#", onClick: this.handleLogout}, "Logout"))
						)
					)
				)
			)
		)
	},
	handleLogout: function(e) {
		OI.logout();

		e.preventDefault();
	},
});
