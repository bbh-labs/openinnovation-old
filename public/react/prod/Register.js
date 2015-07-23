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
	render: function() {
		return (
			React.createElement("div", {className: "valign-wrapper"}, 
				React.createElement("form", {className: "valign", onSubmit: this.handleSubmit}, 
					React.createElement("div", {className: "form-content"}, 
						React.createElement("h4", {className: "form-title"}, "Register"), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {type: "text", id: "register-email", name: "email"}), 
							React.createElement("label", {htmlFor: "register-email"}, "Email")
						), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {type: "password", id: "register-password", name: "password"}), 
							React.createElement("label", {htmlFor: "register-password"}, "Password")
						), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {type: "password", id: "register-confirm-password", name: "confirm-password"}), 
							React.createElement("label", {htmlFor: "register-confirm-password"}, "Confirm Password")
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
	handleSubmit: function(e) {
		var form = e.target;
		var email = form.elements["email"].value;
		var password = form.elements["password"].value;
		var confirmPassword = form.elements["confirm-password"].value;

		e.preventDefault();

		if (password != confirmPassword) {
			Materialize.toast("Password doesn't match confirm password!", 1000, "yellow black-text");
			return;
		}

		OI.register({email: email, password: password});
	},
});
