var Register = React.createClass({
	render: function() {
		return (
			<div className="register valign-wrapper">
				<Register.Form />
			</div>
		)
	},
});

Register.Form = React.createClass({
	mixins: [ Navigation ],
	render: function() {
		return (
			<form className="valign" onSubmit={this.handleSubmit}>
				<img className="img-responsive" src="images/sheep.png" width="50%" />
				<div className="form-content">
					<h4 className="form-title">Register</h4>
					<div className="input-field col s12">
						<input type="text" id="register-email" name="email" />
						<label htmlFor="register-email">Email</label>
					</div>
					<div className="input-field col s12">
						<input type="password" id="register-password" name="password" />
						<label htmlFor="register-password">Password</label>
					</div>
					<div className="input-field col s12">
						<input type="password" id="register-confirm-password" name="confirm-password" />
						<label htmlFor="register-confirm-password">Confirm Password</label>
					</div>
					<button type="submit" className="waves-effect waves-light btn">Register</button>
					<div className="form-links input-field col s12">
						<Link to="login">Already have account?</Link>
					</div>
				</div>
			</form>
		)
	},
	handleSubmit: function(e) {
		var form = e.target;
		var email = form.elements["email"].value;
		var password = form.elements["password"].value;
		var confirmPassword = form.elements["confirm-password"].value;

		if (password != confirmPassword) {
			Materialize.toast("Password doesn't match confirm password!", 1000, "yellow black-text");
			e.preventDefault();
			return;
		}

		if (!dispatcher) {
			this.transitionTo("dashboard");
		} else {
			dispatcher.dispatch({
				type: "register",
				data: {
					email: email,
					password: password,
				},
			});
		}

		e.preventDefault();
	},
});
