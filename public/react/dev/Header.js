var Header = React.createClass({
	mixins: [ Navigation ],
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.mobileButton)).sideNav();
		$(React.findDOMNode(this.refs.moreButton)).dropdown({
			inDuration: 300,
			outDuration: 225,
			constrain_width: false,
			hover: true,
			gutter: 0,
			belowOrigin: true,
		});
	},
	render: function() {
		var user = this.props.user;
		return (
			<header>
				<nav className="row">
					<div className="nav-wrapper container">
						<Link to="dashboard" className="brand-logo">BBH OI</Link>
						<a href="#" data-activates="mobile-menu" className="button-collapse" ref="mobileButton"><i className="material-icons">menu</i></a>
						<ul className="right hide-on-med-and-down">
							<li><Link to="new-project"><i className="material-icons">create</i></Link></li>
							<li><a href="#"><i className="material-icons">mail</i></a></li>
							<li><a href="#"><i className="material-icons">notifications</i></a></li>
							<li>
								<a href="#" className="dropdown-button" data-activates="more-menu" ref="moreButton">
									<i className="material-icons">more_vert</i>
								</a>
							</li>
						</ul>
						<ul id="mobile-menu" className="side-nav">
							<li><Link to="new-project">New Project</Link></li>
							<li><a href="#">Inbox</a></li>
							<li><Link to="user" params={{userID: user.id}}>Profile</Link></li>
							<li><a href="#">Settings</a></li>
							<li><a href="#" onClick={this.logout}>Logout</a></li>
						</ul>
						<ul id="more-menu" className="dropdown-content">
							<li><Link to="user" params={{userID: user.id}}>Profile</Link></li>
							<li><a href="#">Settings</a></li>
							<li><a href="#" onClick={this.logout}>Logout</a></li>
						</ul>
					</div>
				</nav>
			</header>
		)
	},
	logout: function(e) {
		OI.logout();

		e.preventDefault();
	},
});
