var Dashboard = React.createClass({
	render: function() {
		return (
			<main className="dashboard">
				<FeaturedProjects />
				<div className="container">
					<LatestProjects />
					<PersonalizedTasks />
				</div>
			</main>
		)
	},
});
