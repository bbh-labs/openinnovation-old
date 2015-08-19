var Settings = React.createClass({displayName: "Settings",
	render: function() {
		return (
			React.createElement("main", {style: m(this.props.style)}, 
				React.createElement("h5", {style: Styles.PageTitle}, "Settings"), 
				React.createElement("div", {className: "container"}, 
					React.createElement(Settings.Form, null)
				)
			)
		)
	},
});

Settings.Form = React.createClass({displayName: "Form",
	styles: {
		container: {
			padding: "16px 0",
		},
	},
	getInitialState: function() {
		return {
			mailFilter: {
				isRead: false,
				isUnread: true,
				age: 1,
				ageType: "newer_than",
				ageUnit: "week",
				from: [],
				to: [],
			},
		};
	},
	render: function() {
		var mailFilter = OI.getMailPreference();
		var active = mailFilter && mailFilter.length > 0 ? "active" : "";
		return (
			React.createElement("form", {className: "col s12", style: this.styles.container, onSubmit: this.handleSubmit}, 
				React.createElement("h5", null, "Mail Filters"), 
				React.createElement("br", null), 
				React.createElement("div", {className: "input-field col s12"}, 
					React.createElement("input", {id: "subject", type: "text", placeholder: "e.g. brief,-junk (see mails with subject which contains 'brief' word and not 'junk')"}), 
					React.createElement("label", {htmlFor: "subject", className: "active"}, "Subject")
				), 
				React.createElement("div", {className: "input-field col s12"}, 
					React.createElement("input", {id: "from", type: "text", placeholder: "e.g. jane,-jim (see mails from jane but not jim)"}), 
					React.createElement("label", {htmlFor: "from", className: "active"}, "From")
				), 
				React.createElement("div", {className: "input-field col s12"}, 
					React.createElement("input", {id: "to", type: "text", placeholder: "e.g. jane,-jim (see mails to jane but not jim)"}), 
					React.createElement("label", {htmlFor: "to", className: "active"}, "To")
				), 
				React.createElement("p", null, 
					React.createElement("input", {type: "checkbox", id: "is-unread"}), 
					React.createElement("label", {htmlFor: "is-unread"}, "Is Unread?")
				), 
				React.createElement("p", null, 
					React.createElement("input", {type: "checkbox", id: "is-read"}), 
					React.createElement("label", {htmlFor: "is-read"}, "Is Read?")
				), 
				React.createElement("div", {className: "row"}, 
					React.createElement("div", {className: "input-field col s2"}, 
						React.createElement("select", {className: "browser-default", defaultValue: "newer_than"}, 
							React.createElement("option", {value: "newer_than"}, "Newer Than"), 
							React.createElement("option", {value: "older_than"}, "Older Than")
						)
					), 
					React.createElement("div", {className: "input-field col s2"}, 
						React.createElement("input", {type: "number", name: "age"})
					)
				), 
				React.createElement("p", {className: "row"}, 
					React.createElement("span", {className: "col s1"}, 
						React.createElement("input", {name: "day", type: "radio", id: "day"}), 
						React.createElement("label", {htmlFor: "day"}, "Day")
					), 
					React.createElement("span", {className: "col s1"}, 
						React.createElement("input", {name: "month", type: "radio", id: "month"}), 
						React.createElement("label", {htmlFor: "month"}, "Month")
					), 
					React.createElement("span", {className: "col s1"}, 
						React.createElement("input", {name: "year", type: "radio", id: "year"}), 
						React.createElement("label", {htmlFor: "year"}, "Year")
					)
				), 
				React.createElement("button", {className: "btn waves-effect waves-light"}, "Save Settings")
			)
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();

		//var mailFilter = e.target.elements["mail-filter"].value;
		//OI.setMailPreference(mailFilter);
	},
});
