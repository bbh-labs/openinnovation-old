var ForgotPassword = React.createClass({displayName: "ForgotPassword",
	render: function() {
		return (
			React.createElement("div", {className: "forgotpassword valign-wrapper"}, 
				React.createElement(ForgotPassword.Form, null)
			)
		)
	},
});

ForgotPassword.Form = React.createClass({displayName: "Form",
	render: function() {
		return (
			React.createElement("form", {className: "valign", onSubmit: this.handleSubmit}, 
				React.createElement("div", {className: "form-content"}, 
					React.createElement("h4", {className: "form-title"}, "Forgot Password"), 
					React.createElement("div", {className: "input-field col s12"}, 
						React.createElement("input", {type: "text", id: "forgotpassword-email"}), 
						React.createElement("label", {htmlFor: "forgotpassword-email"}, "Email")
					), 
					React.createElement("button", {type: "submit", className: "waves-effect waves-light btn"}, "Reset Password"), 
					React.createElement("div", {className: "form-links input-field col s12"}, 
						React.createElement(Link, {to: "login"}, "Back to Login")
					)
				)
			)
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();
	},
});
