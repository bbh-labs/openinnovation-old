var Dashboard = React.createClass({
	render: function() {
		return (
			<div className="dashboard">
				<Header />
				<main>
					<FeaturedProjects />
					<DailyUpdates />
					<LatestProjects />
					<TasksOfTheDay />
				</main>
				<Footer />
			</div>
		)
	},
});
