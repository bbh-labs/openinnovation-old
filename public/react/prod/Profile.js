var Profile = React.createClass({displayName: "Profile",
	render: function() {
		return (
			React.createElement("div", {className: "profile"}, 
				React.createElement(Header, null), 
				React.createElement("main", null, 
					React.createElement(Profile.Content, null)
				), 
				React.createElement(Footer, null)
			)
		)
	},
});

Profile.Content = React.createClass({displayName: "Content",
	render: function() {
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement("div", {className: "col s12 m4 l3"}, 
					React.createElement("div", {className: "card"}, 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("img", {className: "profile-picture circle", src: "images/profile-pics/1.jpg"})
						), 
						React.createElement("div", {className: "card-action"}, 
							React.createElement("h5", null, "Jacky Boen"), 
							React.createElement("p", null, "Lorem ipsum dolor sit amet consectetur")
						), 
						React.createElement("div", {className: "card-action"}, 
							React.createElement("a", {href: "#"}, React.createElement("i", {className: "material-icons"}, "message"))
						)
					)
				), 
				React.createElement("div", {className: "col s12 m8 l9"}, 
					React.createElement("div", {className: "col s12"}, 
						React.createElement("div", {className: "card"}, 
							React.createElement("div", {className: "card-content"}, 
								React.createElement("h5", null, "Description"), 
								React.createElement("p", null, "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean justo urna, faucibus vitae nisl ut, suscipit tempus mi. Duis volutpat, nisl eget volutpat facilisis, tellus sem mattis mauris, eu posuere ipsum felis ut sapien. Phasellus tristique augue urna, non porttitor nunc pharetra a. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec ullamcorper efficitur ipsum, nec viverra dolor rhoncus quis. In placerat fringilla nibh, in suscipit sapien pharetra ut. Suspendisse eget tellus sapien. Praesent aliquam quis mauris et rutrum. Suspendisse in leo non magna mattis pellentesque eu vel nulla. Cras varius non tellus in varius. Proin sodales nulla enim. Praesent bibendum massa eget pulvinar placerat. Donec eget tristique nisi. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.")
							)
						)
					), 
					React.createElement("div", {className: "col s12"}, 
						React.createElement(InvolvedProjects, null)
					)
				)
			)
		)
	},
});
