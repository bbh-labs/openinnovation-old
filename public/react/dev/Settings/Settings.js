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
	render: function() {
		var mailFilter = OI.getMailPreference();
		try {
			mailFilter = JSON.parse(mailFilter);
		} catch (err) {
		}
		if (typeof(mailFilter) != "object") {
			mailFilter = {
				subject: "",
				from: "",
				to: "",
				age: 1,
				ageType: "newer_than",
				ageUnit: "w",
				isUnread: true,
				isRead: false,
			}
		}
		return (
			<form className="col s12" style={this.styles.container} onSubmit={this.handleSubmit}>
				<h5>Mail Filters</h5>
				<br/>
				<div className="input-field col s12">
					<input id="subject" type="text" name="subject" defaultValue={mailFilter.subject} placeholder="e.g. brief,-junk (mails with subject which contains 'brief' word and not 'junk')" />
					<label htmlFor="subject" className="active">Subject</label>
				</div>
				<div className="input-field col s12">
					<input id="from" type="text" name="from" defaultValue={mailFilter.from} placeholder="e.g. jane,-jim (mails from jane but not jim)" />
					<label htmlFor="from" className="active">From</label>
				</div>
				<div className="input-field col s12">
					<input id="to" type="text"  name="to" defaultValue={mailFilter.to} placeholder="e.g. jane,-jim (mails to jane but not jim)" />
					<label htmlFor="to" className="active">To</label>
				</div>
				<p>
					<input type="checkbox" id="is-unread" name="is-unread" defaultChecked={mailFilter.isUnread} />
					<label htmlFor="is-unread">Is Unread?</label>
				</p>
				<p>
					<input type="checkbox" id="is-read" name="is-read" defaultChecked={mailFilter.isRead} />
					<label htmlFor="is-read">Is Read?</label>
				</p>
				<div className="row">
					<div className="input-field col s2">
						<select className="browser-default" name="age-type" defaultValue={mailFilter.ageType} >
							<option value="newer_than">Newer Than</option>
							<option value="older_than">Older Than</option>
						</select>
					</div>
					<div className="input-field col s2">
						<input type="number" name="age" defaultValue={mailFilter.age} />
					</div>
				</div>
				<p className="row">
					<span className="col s1">
						<input name="age-unit" type="radio" id="day" value="d" defaultChecked={mailFilter.ageUnit == "d"}/>
						<label htmlFor="day">Day</label>
					</span>
					<span className="col s1">
						<input name="age-unit" type="radio" id="week" value="w" defaultChecked={mailFilter.ageUnit == "w"}/>
						<label htmlFor="week">Week</label>
					</span>
					<span className="col s1">
						<input name="age-unit" type="radio" id="month" value="m" defaultChecked={mailFilter.ageUnit == "m"}/>
						<label htmlFor="month">Month</label>
					</span>
				</p>
				<button className="btn waves-effect waves-light">Save Settings</button>
			</form>
		)
	},
	handleSubmit: function(e) {
		e.preventDefault();

		var elems = e.target.elements;
		var subject = elems["subject"].value;
		var from = elems["from"].value;
		var to = elems["to"].value;
		var age = elems["age"].value;
		var ageType = elems["age-type"].value;
		var ageUnit = elems["age-unit"].value;
		var isUnread = elems["is-unread"].checked;
		var isRead = elems["is-read"].checked;

		OI.setMailPreference({
			subject: subject,
			from: from,
			to: to,
			age: parseInt(age),
			ageType: ageType,
			ageUnit: ageUnit,
			isUnread: isUnread,
			isRead: isRead,
		});
	},
});
