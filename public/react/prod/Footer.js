var Footer = React.createClass({displayName: "Footer",
	styles: {
		container: {
			marginTop: 0,
		},
	},
	render: function() {
		return (
			React.createElement("footer", {className: "page-footer", style: this.styles.container}, 
				React.createElement("div", {className: "container"}, 
					"© 2015 Copyright Bartle Bogle Hegarty", 
					React.createElement("div", {className: "footer-links"}, 
						React.createElement("a", {href: "#"}, "About"), 
						React.createElement("a", {href: "#"}, "How it works"), 
						React.createElement("a", {href: "#"}, "Get Involved"), 
						React.createElement("a", {href: "#"}, "FAQ")
					)
				)
			)
		)
	},
});
