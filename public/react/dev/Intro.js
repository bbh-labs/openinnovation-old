var Intro = React.createClass({
	render: function() {
		return (
			<div className="intro">
				<header>
					<nav className="row">
						<div className="nav-wrapper container">
							<Link to="intro" className="brand-logo">BBH OI</Link>
							<a href="#" data-activates="mobile-menu" className="button-collapse" ref="mobileButton">
								<i className="material-icons">menu</i>
							</a>
						</div>
					</nav>
				</header>
				<div className="valign-wrapper">
					<div className="valign">
						<img className="img-responsive" src="images/sheep.png" width="25%" />
						<h1>OPEN INNOVATION</h1>
						<h5>A platform for enabling collaboration between people with different disciplines.</h5>
						<button className="btn google" onClick={this.handleClick}>SIGN IN</button>
					</div>
				</div>
			</div>
		)
	},
	handleClick: function(e) {
		if (!auth2) {
			return;
		}

		auth2.grantOfflineAccess({"scope": "profile email", "redirect_uri": "postmessage"}).then(this.handleSignIn);
	},
	handleSignIn: function(resp) {
		OI.login({code: resp.code});
	},
});
