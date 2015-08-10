var Dashboard = React.createClass({
	render: function() {
		return (
			<main className="dashboard">
				<FeaturedProjects />
				<div className="container">
					<LatestProjects />
					<TasksOfTheDay />
				</div>
			</main>
		)
	},
});
