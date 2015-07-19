var DailyUpdates = React.createClass({displayName: "DailyUpdates",
	render: function() {
		return (
			React.createElement("div", {className: "daily-updates card"}, 
				React.createElement("div", {className: "card-content row"}, 
					React.createElement("div", {className: "col s12"}, 
						React.createElement("h4", {className: ""}, "Daily Updates")
					), 
					React.createElement("div", {className: "col s3"}, 
						React.createElement("div", {className: "card"}, 
							React.createElement("div", {className: "card-image"}, 
								React.createElement("span", {className: "card-title"}, "42")
							), 
							React.createElement("div", {className: "card-content"}, 
								React.createElement("p", {className: "subtitle"}, "tasks were done today")
							)
						)
					), 
					React.createElement("div", {className: "col s3"}, 
						React.createElement("div", {className: "card"}, 
							React.createElement("div", {className: "card-image"}, 
								React.createElement("span", {className: "card-title"}, "7")
							), 
							React.createElement("div", {className: "card-content"}, 
								React.createElement("p", {className: "subtitle"}, "people joined your projects today")
							)
						)
					), 
					React.createElement("div", {className: "col s3"}, 
						React.createElement("div", {className: "card"}, 
							React.createElement("div", {className: "card-image"}, 
								React.createElement("span", {className: "card-title"}, "Nike PTD")
							), 
							React.createElement("div", {className: "card-content"}, 
								React.createElement("p", {className: "subtitle"}, "had 11 people working on it today")
							)
						)
					), 
					React.createElement("div", {className: "col s3"}, 
						React.createElement("div", {className: "card"}, 
							React.createElement("div", {className: "card-image"}, 
								React.createElement("span", {className: "card-title"}, "5")
							), 
							React.createElement("div", {className: "card-content"}, 
								React.createElement("p", {className: "subtitle"}, "people finished their tasks today")
							)
						)
					)
				)
			)
		)
	},
});
