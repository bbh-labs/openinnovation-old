Project.Members = React.createClass({
	render: function() {
		var members = this.props.project.members;
		return (
			<div id="project-members" className="col s12">
				<div className="main col s12">
					<ul className="collection col s12">{
						members ?
						members.map(function(m) {
							return <Project.Members.Item key={m.id} member={m} />
						}) : ""
					}</ul>
				</div>
			</div>
		)
	},
});

Project.Members.Item = React.createClass({
	render: function() {
		var member = this.props.member;
		return (
			<li className="collection-item avatar">
				<Link to="user" params={{userID: member.id}}>
					<img className="circle" src={member.avatarURL} />
					<span className="title" style={{display: "block"}}><strong>{member.fullname}</strong></span>
					<p>{member.title}</p>
				</Link>
			</li>
		)
	},
	handleChat: function(e) {
		dispatcher.dispatch({
			type: "openChatModal",
			data: {
				data: this.props.member,
				type: "user",
			},
		});

		e.preventDefault();
	},
});
