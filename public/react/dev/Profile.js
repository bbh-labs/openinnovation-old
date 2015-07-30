var Profile = React.createClass({
	render: function() {
		return (
			<main className="profile">
				<Profile.Content user={this.props.user} />
			</main>
		)
	},
});

Profile.Content = React.createClass({
	render: function() {
		var user = this.props.user;
		return (
			<div className="row">
				<div className="container">
					<div className="col s12 m4 l3">
						<div className="card">
							<div className="card-content">
								<img className="profile-picture circle" src="images/profile-pics/1.jpg" />
							</div>
							<div className="card-action">
								<Profile.Content.Fullname user={user} />
								<p>{user.title}</p>
							</div>
							<div className="card-action">
								<a href="#"><i className="material-icons">message</i></a>
							</div>
						</div>
					</div>
						<div className="col s12 m9 l8">
							<div className="card">
								<div className="card-content">
									<h5>Description</h5>
									<p>{user.description}</p>
								</div>
							</div>
						</div>
						<div className="col s12 m9 l8">
							<InvolvedProjects />
						</div>
				</div>
			</div>
		)
	},
});

Profile.Content.Fullname = React.createClass({
	getInitialState: function() {
		return {hovering: false, editMode: false};
	},
	render: function() {
		var editMode = this.state.editMode;
		return (
			<div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<h5 ref="fullname" style={{display: "inline"}} contentEditable={this.state.editMode}>{this.props.user.fullname}</h5> {this.editElement()}
			</div>
		)
	},
	handleMouseEnter: function(e) {
		this.setState({hovering: true});
	},
	handleMouseLeave: function(e) {
		this.setState({hovering: false});
	},
	handleClick: function(e) {
		var editMode = this.state.editMode;
		this.setState({editMode: !editMode});

		var fullname = React.findDOMNode(this.refs.fullname);
		if (editMode) {
			var text = $(fullname).text();
			OI.updateUser({fullname: text});
			$(fullname).html(text);
		}
	},
	editElement: function() {
		if (this.state.hovering || this.state.editMode) {
			return <i className="material-icons edit-icon" onClick={this.handleClick}>{this.state.editMode ? "done" : "edit mode"}</i>
		}
	},
});

Profile.Content.Description = React.createClass({
	getInitialState: function() {
		return {hovering: false, editMode: false};
	},
	render: function() {
		var editMode = this.state.editMode;
		return (
			<div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<h5 ref="fullname" style={{display: "inline"}} contentEditable={this.state.editMode}>{this.props.user.fullname}</h5> {this.editElement()}
			</div>
		)
	},
	handleMouseEnter: function(e) {
		this.setState({hovering: true});
	},
	handleMouseLeave: function(e) {
		this.setState({hovering: false});
	},
	handleClick: function(e) {
		var editMode = this.state.editMode;
		this.setState({editMode: !editMode});

		var fullname = React.findDOMNode(this.refs.fullname);
		if (editMode) {
			var text = $(fullname).text();
			OI.updateUser({fullname: text});
			$(fullname).html(text);
		}
	},
	editElement: function() {
		if (this.state.hovering || this.state.editMode) {
			return <i className="material-icons edit-icon" onClick={this.handleClick}>{this.state.editMode ? "done" : "edit mode"}</i>
		}
	},
});
