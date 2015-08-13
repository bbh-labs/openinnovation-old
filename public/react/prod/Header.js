var Header = React.createClass({displayName: "Header",
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
			React.createElement("header", null, 
				React.createElement("nav", {className: "row"}, 
					React.createElement("div", {className: "nav-wrapper container"}, 
						React.createElement(Link, {to: "dashboard", className: "brand-logo"}, "BBH OI"), 
						React.createElement("a", {href: "#", "data-activates": "mobile-menu", className: "button-collapse", ref: "mobileButton"}, 
							React.createElement("i", {className: "material-icons"}, "menu")
						), 
						React.createElement("ul", {className: "right hide-on-med-and-down"}, 
							React.createElement("li", null, React.createElement(Link, {to: "new-project"}, React.createElement("i", {className: "material-icons"}, "create"))), 
							React.createElement("li", null, React.createElement("a", {href: "#", className: "dropdown-button", "data-activates": "mail-dropdown", ref: "mailButton"}, React.createElement("i", {className: "material-icons"}, "mail"))), 
							React.createElement("li", null, React.createElement("a", {href: "#", className: "dropdown-button", "data-activates": "more-dropdown", ref: "moreButton"}, React.createElement("i", {className: "material-icons"}, "more_vert")))
						), 
						React.createElement("ul", {id: "mobile-menu", className: "side-nav"}, 
							React.createElement("li", null, React.createElement(Link, {to: "new-project"}, "New Project")), 
							React.createElement("li", null, React.createElement(Link, {to: "user", params: {userID: user.id}}, "Profile")), 
							React.createElement("li", null, React.createElement(Link, {to: "settings"}, "Settings")), 
							React.createElement("li", null, React.createElement("a", {href: "#", onClick: this.handleLogout}, "Logout"))
						), 
						React.createElement(Header.MailDropdown, {id: "mail-dropdown", user: user, messages: messages}), 
						React.createElement("ul", {id: "more-dropdown", className: "dropdown-content"}, 
							React.createElement("li", null, React.createElement("a", {href: "#"}, "User")), 
							React.createElement("li", null, React.createElement(Link, {to: "settings"}, "Settings")), 
							React.createElement("li", null, React.createElement("a", {href: "#", onClick: this.handleLogout}, "Logout"))
						)
					)
				)
			)
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

Header.MailDropdown = React.createClass({displayName: "MailDropdown",
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
			React.createElement("ul", {id: this.props.id, className: "dropdown-content collection", style: this.styles.mailContainer}, 
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
						React.createElement("li", {key: m.id, className: "collection-item avatar"}, 
							React.createElement(Header.MailDropdown.Image, {from: from}), 
							React.createElement("a", {style: this.styles.mailSubject, href: "https://mail.google.com/mail/?authuser=" + user.email + "#all/" + m.result.id}, 
								React.createElement("span", null, 
									subject
								), 
								React.createElement("p", {style: this.styles.mailFrom}, 
									React.createElement("strong", null, this.parseFullname(from)), React.createElement("br", null), 
									since
								)
							)
						)
					)
				}.bind(this)) : React.createElement("li", null, "No messages")
			)
		)
	},
	parseFullname: function(from) {
		var result = from.match(/(.+)<.+/i);
		return result[1];
	},
});

Header.MailDropdown.Image = React.createClass({displayName: "Image",
	componentDidMount: function() {
		//this.handleLoadImage(this.parseEmail(this.props.from)); 
	},
	render: function() {
		return React.createElement("img", {src: "https://lh3.googleusercontent.com/-GdEHCNn_lK4/AAAAAAAAAAI/AAAAAAAAAAA/Yoo7DfobKYI/s120-c/photo.jpg", className: "circle", onLoad: function(e) {}})
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
