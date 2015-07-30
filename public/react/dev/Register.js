var Register = React.createClass({
	render: function() {
		return (
			<div className="register">
				<Register.Form />
			</div>
		)
	},
});

Register.Form = React.createClass({
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
			<div className="valign-wrapper">
				<form className="valign" onSubmit={this.handleSubmit}>
					<div className="form-content">
						<h4 className="form-title">Register</h4>
						<div className="input-field col s12">
							<input type="text" id="register-fullname" name="fullname" required />
							<label htmlFor="register-fullname">Fullname</label>
						</div>
						<div className="input-field col s12">
							<input type="text" id="register-email" name="email" required />
							<label htmlFor="register-email">Email</label>
						</div>
						<div className="input-field col s12">
							<input type="password" id="register-password" name="password" required />
							<label htmlFor="register-password">Password</label>
						</div>
						<div className="input-field col s12">
							<input type="password" id="register-confirm-password" name="confirm-password" required />
							<label htmlFor="register-confirm-password">Confirm Password</label>
						</div>
						<div className="input-field col s12">
							<select className="browser-default" name="title" defaultValue="">
								<option value="">What are you?</option>
								{this.titleElements()}
							</select>
						</div>
						<button type="submit" className="waves-effect waves-light btn">Register</button>
						<div className="form-links input-field col s12">
							<Link to="login">Already have account?</Link>
						</div>
					</div>
				</form>
			</div>
		)
	},
	titleElements: function() {
		return buildElements(this.state.titles, function(i, p) {
			return <option key={p} value={p}>{p}</option>
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
