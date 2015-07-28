var Dashboard = React.createClass({
	render: function() {
		return (
			<div className="dashboard">
				<Header />
				<main>
					<FeaturedProjects />
					<div className="container">
						<DailyUpdates />
						<LatestProjects />
						<TasksOfTheDay />
					</div>
				</main>
				<Footer />
			</div>
		)
	},
});
