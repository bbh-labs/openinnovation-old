var ForgotPassword = React.createClass({
	render: function() {
		return (
			<div className="forgotpassword valign-wrapper">
				<ForgotPassword.Form />
			</div>
		)
	},
});

ForgotPassword.Form = React.createClass({
	render: function() {
		return (
			<form className="valign" onSubmit={this.handleSubmit}>
				<div className="form-content">
					<h4 className="form-title">Forgot Password</h4>
					<div className="input-field col s12">
						<input type="text" id="forgotpassword-email" />
						<label htmlFor="forgotpassword-email">Email</label>
					</div>
					<button type="submit" className="waves-effect waves-light btn">Reset Password</button>
					<div className="form-links input-field col s12">
						<Link to="login">Back to Login</Link>
					</div>
				</div>
			</form>
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();
	},
});
