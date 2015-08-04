var Header = React.createClass({displayName: "Header",
	mixins: [ Navigation ],
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.mobileButton)).sideNav();
		$(React.findDOMNode(this.refs.moreButton)).dropdown({
			inDuration: 300,
			outDuration: 225,
			constrain_width: false,
			hover: true,
			gutter: 0,
			belowOrigin: true,
		});
	},
	render: function() {
		var user = this.props.user;
		return (
			React.createElement("header", null, 
				React.createElement("nav", {className: "row"}, 
					React.createElement("div", {className: "nav-wrapper container"}, 
						React.createElement(Link, {to: "dashboard", className: "brand-logo"}, "BBH OI"), 
						React.createElement("a", {href: "#", "data-activates": "mobile-menu", className: "button-collapse", ref: "mobileButton"}, React.createElement("i", {className: "material-icons"}, "menu")), 
						React.createElement("ul", {className: "right hide-on-med-and-down"}, 
							React.createElement("li", null, React.createElement(Link, {to: "new-project"}, React.createElement("i", {className: "material-icons"}, "create"))), 
							React.createElement("li", null, React.createElement("a", {href: "#"}, React.createElement("i", {className: "material-icons"}, "mail"))), 
							React.createElement("li", null, React.createElement("a", {href: "#"}, React.createElement("i", {className: "material-icons"}, "notifications"))), 
							React.createElement("li", null, 
								React.createElement("a", {href: "#", className: "dropdown-button", "data-activates": "more-menu", ref: "moreButton"}, 
									React.createElement("i", {className: "material-icons"}, "more_vert")
								)
							)
						), 
						React.createElement("ul", {id: "mobile-menu", className: "side-nav"}, 
							React.createElement("li", null, React.createElement(Link, {to: "new-project"}, "New Project")), 
							React.createElement("li", null, React.createElement("a", {href: "#"}, "Inbox")), 
							React.createElement("li", null, React.createElement(Link, {to: "user", params: {userID: user.id}}, "Profile")), 
							React.createElement("li", null, React.createElement("a", {href: "#"}, "Settings")), 
							React.createElement("li", null, React.createElement("a", {href: "#", onClick: this.logout}, "Logout"))
						), 
						React.createElement("ul", {id: "more-menu", className: "dropdown-content"}, 
							React.createElement("li", null, React.createElement(Link, {to: "user", params: {userID: user.id}}, "Profile")), 
							React.createElement("li", null, React.createElement("a", {href: "#"}, "Settings")), 
							React.createElement("li", null, React.createElement("a", {href: "#", onClick: this.logout}, "Logout"))
						)
					)
				), 

				React.createElement(ChatModal, {user: user})
			)
		)
	},
	logout: function(e) {
		OI.logout();

		e.preventDefault();
	},
});
