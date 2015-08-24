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
	render: function() {
		var mailFilter = OI.getMailPreference();
		try {
			mailFilter = JSON.parse(mailFilter);
		} catch (err) {
		}
		if (typeof(mailFilter) != "object") {
			mailFilter = {
				subject: "",
				from: "",
				to: "",
				age: 1,
				ageType: "newer_than",
				ageUnit: "w",
				isUnread: true,
				isRead: false,
			}
		}
		return (
			React.createElement("form", {className: "col s12", style: this.styles.container, onSubmit: this.handleSubmit}, 
				React.createElement("h5", null, "Mail Filters"), 
				React.createElement("br", null), 
				React.createElement("div", {className: "input-field col s12"}, 
					React.createElement("input", {id: "subject", type: "text", name: "subject", defaultValue: mailFilter.subject, placeholder: "e.g. brief,-junk (mails with subject which contains 'brief' word and not 'junk')"}), 
					React.createElement("label", {htmlFor: "subject", className: "active"}, "Subject")
				), 
				React.createElement("div", {className: "input-field col s12"}, 
					React.createElement("input", {id: "from", type: "text", name: "from", defaultValue: mailFilter.from, placeholder: "e.g. jane,-jim (mails from jane but not jim)"}), 
					React.createElement("label", {htmlFor: "from", className: "active"}, "From")
				), 
				React.createElement("div", {className: "input-field col s12"}, 
					React.createElement("input", {id: "to", type: "text", name: "to", defaultValue: mailFilter.to, placeholder: "e.g. jane,-jim (mails to jane but not jim)"}), 
					React.createElement("label", {htmlFor: "to", className: "active"}, "To")
				), 
				React.createElement("p", null, 
					React.createElement("input", {type: "checkbox", id: "is-unread", name: "is-unread", defaultChecked: mailFilter.isUnread}), 
					React.createElement("label", {htmlFor: "is-unread"}, "Is Unread?")
				), 
				React.createElement("p", null, 
					React.createElement("input", {type: "checkbox", id: "is-read", name: "is-read", defaultChecked: mailFilter.isRead}), 
					React.createElement("label", {htmlFor: "is-read"}, "Is Read?")
				), 
				React.createElement("div", {className: "row"}, 
					React.createElement("div", {className: "input-field col s2"}, 
						React.createElement("select", {className: "browser-default", name: "age-type", defaultValue: mailFilter.ageType}, 
							React.createElement("option", {value: "newer_than"}, "Newer Than"), 
							React.createElement("option", {value: "older_than"}, "Older Than")
						)
					), 
					React.createElement("div", {className: "input-field col s2"}, 
						React.createElement("input", {type: "number", name: "age", defaultValue: mailFilter.age})
					)
				), 
				React.createElement("p", {className: "row"}, 
					React.createElement("span", {className: "col s1"}, 
						React.createElement("input", {name: "age-unit", type: "radio", id: "day", value: "d", defaultChecked: mailFilter.ageUnit == "d"}), 
						React.createElement("label", {htmlFor: "day"}, "Day")
					), 
					React.createElement("span", {className: "col s1"}, 
						React.createElement("input", {name: "age-unit", type: "radio", id: "week", value: "w", defaultChecked: mailFilter.ageUnit == "w"}), 
						React.createElement("label", {htmlFor: "week"}, "Week")
					), 
					React.createElement("span", {className: "col s1"}, 
						React.createElement("input", {name: "age-unit", type: "radio", id: "month", value: "m", defaultChecked: mailFilter.ageUnit == "m"}), 
						React.createElement("label", {htmlFor: "month"}, "Month")
					)
				), 
				React.createElement("button", {className: "btn waves-effect waves-light"}, "Save Settings")
			)
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();

		var elems = e.target.elements;
		var subject = elems["subject"].value;
		var from = elems["from"].value;
		var to = elems["to"].value;
		var age = elems["age"].value;
		var ageType = elems["age-type"].value;
		var ageUnit = elems["age-unit"].value;
		var isUnread = elems["is-unread"].checked;
		var isRead = elems["is-read"].checked;

		OI.setMailPreference({
			subject: subject,
			from: from,
			to: to,
			age: parseInt(age),
			ageType: ageType,
			ageUnit: ageUnit,
			isUnread: isUnread,
			isRead: isRead,
		});
	},
});
