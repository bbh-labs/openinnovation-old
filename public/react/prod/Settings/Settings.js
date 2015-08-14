var Settings = React.createClass({displayName: "Settings",
	render: function() {
		return (
			React.createElement("main", null, 
				React.createElement("div", {className: "row"}, 
					React.createElement("div", {className: "container"}, 
						React.createElement(Settings.Form, null)
					)
				)
			)
		)
	},
});

Settings.Form = React.createClass({displayName: "Form",
	render: function() {
		var mailFilter = OI.getMailPreference();
		var active = mailFilter && mailFilter.length > 0 ? "active" : "";
		return (
			React.createElement("form", {className: "col s12", onSubmit: this.handleSubmit}, 
				React.createElement("div", {className: "input-field col s12"}, 
					React.createElement("input", {id: "mail-filter", type: "text", name: "mail-filter", defaultValue: mailFilter}), 
					React.createElement("label", {htmlFor: "mail-filter", className: active}, "Mail Filter")
				), 
				React.createElement("button", {className: "btn waves-effect waves-light"}, "Save Settings")
			)
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();

		var mailFilter = e.target.elements["mail-filter"].value;
		OI.setMailPreference(mailFilter);
	},
});
