var Header = React.createClass({
	mixins: [ Navigation ],
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.mobileButton)).sideNav();
	},
	render: function() {
		var user = this.props.user;
		return (
			<header>
				<nav className="row">
					<div className="nav-wrapper container">
						<Link to="dashboard" className="brand-logo">BBH OI</Link>
						<a href="#" data-activates="mobile-menu" className="button-collapse" ref="mobileButton">
							<i className="material-icons">menu</i>
						</a>
						<ul className="right hide-on-med-and-down">
							<li><Link to="new-project"><i className="material-icons">create</i></Link></li>
							<li><Link to="user" params={{userID: user.id}}><i className="material-icons">person</i></Link></li>
							<li><a href="#" onClick={this.handleLogout}><i className="material-icons">input</i></a></li>
						</ul>
						<ul id="mobile-menu" className="side-nav">
							<li><Link to="new-project">New Project</Link></li>
							<li><Link to="user" params={{userID: user.id}}>Profile</Link></li>
							<li><a href="#" onClick={this.handleLogout}>Logout</a></li>
						</ul>
					</div>
				</nav>
			</header>
		)
	},
	handleLogout: function(e) {
		OI.logout();

		e.preventDefault();
	},
});
