var Settings = React.createClass({
	render: function() {
		return (
			<main>
				<div className="row">
					<div className="container">
						<Settings.Form />
					</div>
				</div>
			</main>
		)
	},
});

Settings.Form = React.createClass({
	render: function() {
		var mailFilter = OI.getMailPreference();
		var active = mailFilter && mailFilter.length > 0 ? "active" : "";
		return (
			<form className="col s12" onSubmit={this.handleSubmit}>
				<div className="input-field col s12">
					<input id="mail-filter" type="text" name="mail-filter" defaultValue={mailFilter} />
					<label htmlFor="mail-filter" className={active}>Mail Filter</label>
				</div>
				<button className="btn waves-effect waves-light">Save Settings</button>
			</form>
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();

		var mailFilter = e.target.elements["mail-filter"].value;
		OI.setMailPreference(mailFilter);
	},
});
