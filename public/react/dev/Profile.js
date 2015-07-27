var Profile = React.createClass({
	render: function() {
		return (
			<div className="profile">
				<Header />
				<main>
					<Profile.Content />
				</main>
				<Footer />
			</div>
		)
	},
});

Profile.Content = React.createClass({
	render: function() {
		return (
			<div className="row">
				<div className="col s12 m4 l3">
					<div className="card">
						<div className="card-content">
							<img className="profile-picture circle" src="images/profile-pics/1.jpg" />
						</div>
						<div className="card-action">
							<h5>Jacky Boen</h5>
							<p>Lorem ipsum dolor sit amet consectetur</p>
						</div>
						<div className="card-action">
							<a href="#"><i className="material-icons">message</i></a>
						</div>
					</div>
				</div>
				<div className="col s12 m8 l9">
					<div className="col s12">
						<div className="card">
							<div className="card-content">
								<h5>Description</h5>
								<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean justo urna, faucibus vitae nisl ut, suscipit tempus mi. Duis volutpat, nisl eget volutpat facilisis, tellus sem mattis mauris, eu posuere ipsum felis ut sapien. Phasellus tristique augue urna, non porttitor nunc pharetra a. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec ullamcorper efficitur ipsum, nec viverra dolor rhoncus quis. In placerat fringilla nibh, in suscipit sapien pharetra ut. Suspendisse eget tellus sapien. Praesent aliquam quis mauris et rutrum. Suspendisse in leo non magna mattis pellentesque eu vel nulla. Cras varius non tellus in varius. Proin sodales nulla enim. Praesent bibendum massa eget pulvinar placerat. Donec eget tristique nisi. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
							</div>
						</div>
					</div>
					<div className="col s12">
						<InvolvedProjects />
					</div>
				</div>
			</div>
		)
	},
});
