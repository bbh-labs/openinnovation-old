var TasksOfTheDay = React.createClass({
	render: function() {
		return (
			<div className="tasks-of-the-day card">
				<div className="card-content">
					<h4 className="">Tasks of the Day</h4>
					<ul className="collection">
						<li className="collection-item avatar">
							<img className="circle" src="images/profile-pics/1.jpg" />
							<span className="title">Title</span>
							<p>First line <br/>
							   Second line
							</p>
							<a href="#" className="secondary-content"><i className="material-icons">send</i></a>
						</li>
						<li className="collection-item avatar">
							<img className="circle" src="images/profile-pics/1.jpg" />
							<span className="title">Title</span>
							<p>First line <br/>
							   Second line
							</p>
							<a href="#" className="secondary-content"><i className="material-icons">send</i></a>
						</li>
						<li className="collection-item avatar">
							<img className="circle" src="images/profile-pics/1.jpg" />
							<span className="title">Title</span>
							<p>First line <br/>
							   Second line
							</p>
							<a href="#" className="secondary-content"><i className="material-icons">send</i></a>
						</li>
					</ul>
				</div>
				<div className="card-action">
					<a href="#" className="mdl-button">View More</a>
				</div>
			</div>
		)
	},
});
