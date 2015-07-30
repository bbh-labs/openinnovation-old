var Dashboard = React.createClass({displayName: "Dashboard",
	render: function() {
		return (
			React.createElement("main", {className: "dashboard"}, 
				React.createElement(FeaturedProjects, null), 
				React.createElement("div", {className: "container"}, 
					React.createElement(DailyUpdates, null), 
					React.createElement(LatestProjects, null), 
					React.createElement(TasksOfTheDay, null)
				)
			)
		)
	},
});
