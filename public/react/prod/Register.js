var Register = React.createClass({displayName: "Register",
	render: function() {
		return (
			React.createElement("div", {className: "register"}, 
				React.createElement(Register.Form, null)
			)
		)
	},
});

Register.Form = React.createClass({displayName: "Form",
	mixins: [ Navigation ],
	getInitialState: function() {
		return {titles: []};
	},
	componentDidMount: function() {
		$.ajax({
			url: "/titles.json",
			method: "GET",
			dataType: "json",
		}).done(function(resp) {
			this.setState({titles: resp});
		}.bind(this)).fail(function(resp) {
			console.log(resp.responseText);
		});
	},
	render: function() {
		return (
			React.createElement("div", {className: "valign-wrapper"}, 
				React.createElement("form", {className: "valign", onSubmit: this.handleSubmit}, 
					React.createElement("div", {className: "form-content"}, 
						React.createElement("h4", {className: "form-title"}, "Register"), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {type: "text", id: "register-fullname", name: "fullname", required: true}), 
							React.createElement("label", {htmlFor: "register-fullname"}, "Fullname")
						), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {type: "text", id: "register-email", name: "email", required: true}), 
							React.createElement("label", {htmlFor: "register-email"}, "Email")
						), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {type: "password", id: "register-password", name: "password", required: true}), 
							React.createElement("label", {htmlFor: "register-password"}, "Password")
						), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {type: "password", id: "register-confirm-password", name: "confirm-password", required: true}), 
							React.createElement("label", {htmlFor: "register-confirm-password"}, "Confirm Password")
						), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("select", {className: "browser-default", name: "title", defaultValue: ""}, 
								React.createElement("option", {value: ""}, "What are you?"), 
								this.titleElements()
							)
						), 
						React.createElement("button", {type: "submit", className: "waves-effect waves-light btn"}, "Register"), 
						React.createElement("div", {className: "form-links input-field col s12"}, 
							React.createElement(Link, {to: "login"}, "Already have account?")
						)
					)
				)
			)
		)
	},
	titleElements: function() {
		return buildElements(this.state.titles, function(i, p) {
			return React.createElement("option", {key: p, value: p}, p)
		});
	},
	handleSubmit: function(e) {
		var form = e.target;
		var password = form.elements["password"].value;
		var confirmPassword = form.elements["confirm-password"].value;

		e.preventDefault();

		if (password != confirmPassword) {
			Materialize.toast("Password doesn't match confirm password!", 1000, "yellow black-text");
			return;
		}

		OI.register($(form).serialize());
	},
});
