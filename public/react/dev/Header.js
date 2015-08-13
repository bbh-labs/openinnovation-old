var Header = React.createClass({
	mixins: [ Navigation ],
	getInitialState: function() {
		return {messages: []};
	},
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.mobileButton)).sideNav();

		// Mail button
		$(React.findDOMNode(this.refs.mailButton)).dropdown({
			hover: true,
			belowOrigin: true,
			constrain_width: false,
		});

		// More button
		$(React.findDOMNode(this.refs.moreButton)).dropdown({
			hover: true,
			belowOrigin: true,
		});

		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "googleMailReady":
				this.fetchMails();
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var user = this.props.user;
		var messages = this.state.messages;
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
							<li><a href="#" className="dropdown-button" data-activates="mail-dropdown" ref="mailButton"><i className="material-icons">mail</i></a></li>
							<li><a href="#" className="dropdown-button" data-activates="more-dropdown" ref="moreButton"><i className="material-icons">more_vert</i></a></li>
						</ul>
						<ul id="mobile-menu" className="side-nav">
							<li><Link to="new-project">New Project</Link></li>
							<li><Link to="user" params={{userID: user.id}}>Profile</Link></li>
							<li><Link to="settings">Settings</Link></li>
							<li><a href="#" onClick={this.handleLogout}>Logout</a></li>
						</ul>
						<Header.MailDropdown id="mail-dropdown" user={user} messages={messages} />
						<ul id="more-dropdown" className="dropdown-content">
							<li><Link to="user" params={{userID: user.id}}>Profile</Link></li>
							<li><Link to="settings">Settings</Link></li>
							<li><a href="#" onClick={this.handleLogout}>Logout</a></li>
						</ul>
					</div>
				</nav>
			</header>
		)
	},
	fetchMails: function() {
		listThreads({
			q: OI.getMailPreference(),
			maxResults: 10,
		}, function(threads) {
			if (threads && !threads[0]) {
				return;
			}

			getFullMessagesOfThreads(threads, function(messages) {
				var ms = [];
				for (key in messages) {
					ms.push(messages[key]);
				}
				ms = ms.sort(function(a, b) {
					return parseInt(b.result.id, 16) - parseInt(a.result.id, 16);
				});
				this.setState({messages: ms});
			}.bind(this));
		}.bind(this), true);
	},
	handleLogout: function(e) {
		OI.logout();

		e.preventDefault();
	},
	handleMail: function(user, m) {
		window.location.replace(); 	
	},
});

Header.MailDropdown = React.createClass({
	styles: {
		mailContainer: {
			minWidth: "250px",
			maxWidth: "100%",
			padding: 0,
		},
		mailSubject: {
			fontSize: "1rem",
			padding: 0,
		},
		mailFrom: {
			fontSize: "0.8rem",
		},
	},
	render: function() {
		var user = this.props.user;
		var messages = this.props.messages;
		return (
			<ul id={this.props.id} className="dropdown-content collection" style={this.styles.mailContainer}>{
				messages && messages.length > 0 ? messages.map(function(m) {
					var headers = m.result.payload.headers;
					var subject = "";
					var from = "";
					var since = "";
					for (header of headers) {
						if (header.name == "Subject") {
							subject = header.value;
						} else if (header.name == "From") {
							from = header.value;
						} else if (header.name == "Date") {
							since = moment(header.value, "ddd, D MMM YYYY HH:mm:ss Z").fromNow();
						}
					}
					return (
						<li key={m.id} className="collection-item avatar">
							<Header.MailDropdown.Image from={from} />
							<a style={this.styles.mailSubject} href={"https://mail.google.com/mail/?authuser=" + user.email + "#all/" + m.result.id}>
								<span>
									{subject}
								</span>
								<p style={this.styles.mailFrom}>
									<strong>{this.parseFullname(from)}</strong><br/>
									{since}
								</p>
							</a>
						</li>
					)
				}.bind(this)) : <li>No messages</li>
			}</ul>
		)
	},
	parseFullname: function(from) {
		var result = from.match(/(.+)<.+/i);
		return result[1];
	},
});

Header.MailDropdown.Image = React.createClass({
	componentDidMount: function() {
		//this.handleLoadImage(this.parseEmail(this.props.from)); 
	},
	render: function() {
		return <img src="https://lh3.googleusercontent.com/-GdEHCNn_lK4/AAAAAAAAAAI/AAAAAAAAAAA/Yoo7DfobKYI/s120-c/photo.jpg" className="circle" onLoad={function(e) {}} />
	},
	handleLoadImage: function(email) {
		var element = React.findDOMNode(this);
		getPeople(email, function(resp) {
			if (!resp.image) {
				return;
			}

			var imageURL = resp.image.url;
			if (imageURL) {
				element.src = imageURL;
			}
		});
	},
	parseEmail: function(from) {
		var result = from.match(/.+<(.+@bartleboglehegarty.+)>.*/i);
		if (result && result.length > 1) {
			return result[1];
		}
		return "";
	},
});
