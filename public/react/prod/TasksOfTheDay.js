var TasksOfTheDay = React.createClass({displayName: "TasksOfTheDay",
	render: function() {
		return (
			React.createElement("div", {className: "tasks-of-the-day card"}, 
				React.createElement("div", {className: "card-content"}, 
					React.createElement("h4", {className: ""}, "Tasks of the Day"), 
					React.createElement("ul", {className: "collection"}, 
						React.createElement("li", {className: "collection-item avatar"}, 
							React.createElement("img", {className: "circle", src: "images/profile-pics/1.jpg"}), 
							React.createElement("span", {className: "title"}, "Title"), 
							React.createElement("p", null, "First line ", React.createElement("br", null), 
							   "Second line"
							), 
							React.createElement("a", {href: "#", className: "secondary-content"}, React.createElement("i", {className: "material-icons"}, "send"))
						), 
						React.createElement("li", {className: "collection-item avatar"}, 
							React.createElement("img", {className: "circle", src: "images/profile-pics/1.jpg"}), 
							React.createElement("span", {className: "title"}, "Title"), 
							React.createElement("p", null, "First line ", React.createElement("br", null), 
							   "Second line"
							), 
							React.createElement("a", {href: "#", className: "secondary-content"}, React.createElement("i", {className: "material-icons"}, "send"))
						), 
						React.createElement("li", {className: "collection-item avatar"}, 
							React.createElement("img", {className: "circle", src: "images/profile-pics/1.jpg"}), 
							React.createElement("span", {className: "title"}, "Title"), 
							React.createElement("p", null, "First line ", React.createElement("br", null), 
							   "Second line"
							), 
							React.createElement("a", {href: "#", className: "secondary-content"}, React.createElement("i", {className: "material-icons"}, "send"))
						)
					)
				), 
				React.createElement("div", {className: "card-action"}, 
					React.createElement("a", {href: "#", className: "mdl-button"}, "View More")
				)
			)
		)
	},
});
