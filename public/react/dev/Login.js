var Login = React.createClass({
	render: function() {
		return (
			<div className="login">
				<Login.Form />
			</div>
		)
	},
});

Login.Form = React.createClass({
	mixins: [ Navigation ],
	render: function() {
		return (
			<div className="valign-wrapper">
				<form className="valign" onSubmit={this.handleSubmit}>
					<img className="img-responsive" src="images/sheep.png" width="50%" />
					<div className="form-content">
						<h4 className="form-title">Login</h4>
						<div className="input-field col s12">
							<input type="text" id="login-email" name="email" />
							<label htmlFor="login-email">Email</label>
						</div>
						<div className="input-field col s12">
							<input type="password" id="login-password" name="password" />
							<label htmlFor="login-password">Password</label>
						</div>
						<button type="submit" className="waves-effect waves-light btn">Login</button>
						<div className="form-links input-field col s12">
							<Link to="forgotpassword" className="col s6">Forgot password?</Link>
							<Link to="register" className="col s6">Don't have account?</Link>
						</div>
					</div>
				</form>
			</div>
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
