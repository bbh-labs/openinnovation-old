var DailyUpdates = React.createClass({
	render: function() {
		return (
			<div className="daily-updates card">
				<div className="card-content row">
					<div className="col s12">
						<h4 className="">Daily Updates</h4>
					</div>
					<div className="col s3">
						<div className="card">
							<div className="card-image">
								<span className="card-title">42</span>
							</div>
							<div className="card-content">
								<p className="subtitle">tasks were done today</p>
							</div>
						</div>
					</div>
					<div className="col s3">
						<div className="card">
							<div className="card-image">
								<span className="card-title">7</span>
							</div>
							<div className="card-content">
								<p className="subtitle">people joined your projects today</p>
							</div>
						</div>
					</div>
					<div className="col s3">
						<div className="card">
							<div className="card-image">
								<span className="card-title">Nike PTD</span>
							</div>
							<div className="card-content">
								<p className="subtitle">had 11 people working on it today</p>
							</div>
						</div>
					</div>
					<div className="col s3">
						<div className="card">
							<div className="card-image">
								<span className="card-title">5</span>
							</div>
							<div className="card-content">
								<p className="subtitle">people finished their tasks today</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	},
});
