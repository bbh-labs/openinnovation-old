var Intro = React.createClass({
	render: function() {
		return (
			<div className="intro">
				<header>
					<nav className="row">
						<div className="nav-wrapper container">
							<Link to="intro" className="brand-logo">BBH OI</Link>
							<a href="#" data-activates="mobile-menu" className="button-collapse" ref="mobileButton"><i className="material-icons">menu</i></a>
							<ul className="right">
								<li><Link to="login">Login</Link></li>
								<li><Link to="register">Register</Link></li>
							</ul>
							<ul className="side-nav" id="mobile-menu">
								<li><Link to="login">Login</Link></li>
								<li><Link to="register">Register</Link></li>
							</ul>
						</div>
					</nav>
				</header>
				<div className="valign-wrapper">
					<div className="valign">
						<img className="img-responsive" src="images/sheep.png" width="25%" />
						<h1>OPEN INNOVATION</h1>
						<h5>A platform for enabling collaboration between people with different disciplines.</h5>
					</div>
				</div>
			</div>
		)
	},
});
