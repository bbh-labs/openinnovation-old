var TasksOfTheDay = React.createClass({displayName: "TasksOfTheDay",
	render: function() {
		return (
			React.createElement("section", {className: "section--center mdl-grid mdl-grid--no-spacing mdl-shadow--2dp"}, 
				React.createElement("div", {className: "daily-tasks mdl-card mdl-cell mdl-cell--12-col"}, 
					React.createElement("div", {className: "mdl-card__supporting-text mdl-grid"}, 
						React.createElement("h4", {className: "mdl-cell mdl-cell--12-col"}, "Tasks of the Day"), 
						React.createElement("div", {className: "mdl-cell mdl-cell--2-col mdl-cell--1-col-phone"}, 
							React.createElement("div", {className: "circle mdl-color--primary"})
						), 
						React.createElement("div", {className: "mdl-cell mdl-cell--10-col mdl-cell--6-col-tablet mdl-cell--3-col-phone"}, 
							React.createElement("h5", null, "Lorem ipsum dolor sit amet"), 
							React.createElement("p", null, "In sagittis, lorem a auctor sollicitudin, enim diam tempus diam, vitae egestas lectus nec libero")
						), 
						React.createElement("div", {className: "mdl-cell mdl-cell--2-col mdl-cell--1-col-phone"}, 
							React.createElement("div", {className: "circle mdl-color--primary"})
						), 
						React.createElement("div", {className: "mdl-cell mdl-cell--10-col mdl-cell--6-col-tablet mdl-cell--3-col-phone"}, 
							React.createElement("h5", null, "Lorem ipsum dolor sit amet"), 
							React.createElement("p", null, "In sagittis, lorem a auctor sollicitudin, enim diam tempus diam, vitae egestas lectus nec libero")
						), 
						React.createElement("div", {className: "mdl-cell mdl-cell--2-col mdl-cell--1-col-phone"}, 
							React.createElement("div", {className: "circle mdl-color--primary"})
						), 
						React.createElement("div", {className: "mdl-cell mdl-cell--10-col mdl-cell--6-col-tablet mdl-cell--3-col-phone"}, 
							React.createElement("h5", null, "Lorem ipsum dolor sit amet"), 
							React.createElement("p", null, "In sagittis, lorem a auctor sollicitudin, enim diam tempus diam, vitae egestas lectus nec libero")
						)
					), 
					React.createElement("div", {className: "mdl-card__actions"}, 
						React.createElement("a", {href: "#", className: "mdl-button"}, "View More")
					)
				)
			)
		)
	},
});
