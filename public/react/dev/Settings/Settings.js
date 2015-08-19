var Settings = React.createClass({
	render: function() {
		return (
			<main style={m(this.props.style)}>
				<h5 style={Styles.PageTitle}>Settings</h5>
				<div className="container">
					<Settings.Form />
				</div>
			</main>
		)
	},
});

Settings.Form = React.createClass({
	styles: {
		container: {
			padding: "16px 0",
		},
	},
	getInitialState: function() {
		return {
			mailFilter: {
				isRead: false,
				isUnread: true,
				age: 1,
				ageType: "newer_than",
				ageUnit: "week",
				from: [],
				to: [],
			},
		};
	},
	render: function() {
		var mailFilter = OI.getMailPreference();
		var active = mailFilter && mailFilter.length > 0 ? "active" : "";
		return (
			<form className="col s12" style={this.styles.container} onSubmit={this.handleSubmit}>
				<h5>Mail Filters</h5>
				<br/>
				<div className="input-field col s12">
					<input id="subject" type="text" placeholder="e.g. brief,-junk (see mails with subject which contains 'brief' word and not 'junk')" />
					<label htmlFor="subject" className="active">Subject</label>
				</div>
				<div className="input-field col s12">
					<input id="from" type="text" placeholder="e.g. jane,-jim (see mails from jane but not jim)" />
					<label htmlFor="from" className="active">From</label>
				</div>
				<div className="input-field col s12">
					<input id="to" type="text"  placeholder="e.g. jane,-jim (see mails to jane but not jim)" />
					<label htmlFor="to" className="active">To</label>
				</div>
				<p>
					<input type="checkbox" id="is-unread" />
					<label htmlFor="is-unread">Is Unread?</label>
				</p>
				<p>
					<input type="checkbox" id="is-read" />
					<label htmlFor="is-read">Is Read?</label>
				</p>
				<div className="row">
					<div className="input-field col s2">
						<select className="browser-default" defaultValue="newer_than">
							<option value="newer_than">Newer Than</option>
							<option value="older_than">Older Than</option>
						</select>
					</div>
					<div className="input-field col s2">
						<input type="number" name="age" />
					</div>
				</div>
				<p className="row">
					<span className="col s1">
						<input name="day" type="radio" id="day" />
						<label htmlFor="day">Day</label>
					</span>
					<span className="col s1">
						<input name="month" type="radio" id="month" />
						<label htmlFor="month">Month</label>
					</span>
					<span className="col s1">
						<input name="year" type="radio" id="year" />
						<label htmlFor="year">Year</label>
					</span>
				</p>
				<button className="btn waves-effect waves-light">Save Settings</button>
			</form>
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();

		//var mailFilter = e.target.elements["mail-filter"].value;
		//OI.setMailPreference(mailFilter);
	},
});
