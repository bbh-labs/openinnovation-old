var Dashboard = React.createClass({displayName: "Dashboard",
	render: function() {
		return (
			React.createElement("div", {className: "dashboard"}, 
				React.createElement(Header, null), 
				React.createElement("main", null, 
					React.createElement(FeaturedProjects, null), 
					React.createElement("div", {className: "container"}, 
						React.createElement(DailyUpdates, null), 
						React.createElement(LatestProjects, null), 
						React.createElement(TasksOfTheDay, null)
					)
				), 
				React.createElement(Footer, null)
			)
		)
	},
});
