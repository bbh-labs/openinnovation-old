Project.Members = React.createClass({
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

		$(React.findDOMNode(this.refs.modalTrigger)).leanModal({
			dismissable: true,
		});
	},
	render: function() {
		return (
			<div id="project-members" className="col s12">
				<div className="main col l9">
					<div className="input-field col s12 m4">
						<input id="task-search" type="text" required />
						<label htmlFor="task-search">Search</label>
					</div>
					<div className="input-field col s12 m4">
						<select className="browser-default" defaultValue="">
							<option value="">Any type</option>
							{this.titleElements()}
						</select>
					</div>
					<ul className="collection col s12">
						{this.memberElements()}
					</ul>
				</div>
				<div className="sidebar col s12 m4 l3">
					<div className="card small">
						<div className="card-image">
							<h5 className="card-title">Members size</h5>
						</div>
						<div className="card-content">
							<h1>9</h1>
							<p>people</p>
						</div>
					</div>
				</div>
			</div>
		)
	},
	memberElements: function() {
		return buildElements(this.props.project.members, function(i, m) {
			return <Project.Members.Item key={m.id} member={m} />
		});
	},
	titleElements: function() {
		return buildElements(this.state.titles, function(i, p) {
			return <option key={p} value={p}>{p}</option>
		});
	},
});

Project.Members.Item = React.createClass({
	render: function() {
		var member = this.props.member;
		return (
			<li className="collection-item avatar">
				<img className="circle" src="images/profile-pics/1.jpg" />
				<span className="title"><strong>{member.fullname}</strong></span>
				<p>{member.title}</p>
				<Link to="user" params={{userID: member.id}} className="secondary-content">
					<i className="material-icons">send</i>
				</Link>
			</li>
		)
	},
});
