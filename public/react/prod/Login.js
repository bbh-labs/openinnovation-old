var Login = React.createClass({displayName: "Login",
	render: function() {
		return (
			React.createElement("div", {className: "login"}, 
				React.createElement(Login.Form, null)
			)
		)
	},
});

Login.Form = React.createClass({displayName: "Form",
	mixins: [ Navigation ],
	render: function() {
		return (
			React.createElement("div", {className: "valign-wrapper"}, 
				React.createElement("form", {className: "valign", onSubmit: this.handleSubmit}, 
					React.createElement("img", {className: "img-responsive", src: "images/sheep.png", width: "50%"}), 
					React.createElement("div", {className: "form-content"}, 
						React.createElement("h4", {className: "form-title"}, "Login"), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {type: "text", id: "login-email", name: "email"}), 
							React.createElement("label", {htmlFor: "login-email"}, "Email")
						), 
						React.createElement("div", {className: "input-field col s12"}, 
							React.createElement("input", {type: "password", id: "login-password", name: "password"}), 
							React.createElement("label", {htmlFor: "login-password"}, "Password")
						), 
						React.createElement("button", {type: "submit", className: "waves-effect waves-light btn"}, "Login"), 
						React.createElement("div", {className: "form-links input-field col s12"}, 
							React.createElement(Link, {to: "forgotpassword", className: "col s6"}, "Forgot password?"), 
							React.createElement(Link, {to: "register", className: "col s6"}, "Don't have account?")
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

		if (!dispatcher) {
			this.transitionTo("dashboard");
		} else {
			dispatcher.dispatch({
				type: "login",
				data: {
					email: email,
					password: password,
				},
			});
		}

		e.preventDefault();
	},
});
