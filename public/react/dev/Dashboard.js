var Dashboard = React.createClass({
	render: function() {
		return (
			<main className="dashboard">
				<FeaturedProjects />
				<div className="container">
					<DailyUpdates />
					<LatestProjects />
					<TasksOfTheDay />
				</div>
			</main>
		)
	},
});
