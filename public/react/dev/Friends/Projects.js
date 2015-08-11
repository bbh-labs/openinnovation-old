Friends.Projects = React.createClass({
	styles: {
		container: {
			flex: "1 1 auto",
			display: "none",
			overflowY: "scroll",
			background: "linear-gradient(#f0f0f0, #ffffff)",
			border: "1px solid #f0f0f0",
		},
	},
	render: function() {
		var user = this.props.user;
		var projects = this.props.projects;
		return (
			<div id="projects" style={m(this.styles.container, this.props.style)}>
			{
				projects ?
				projects.map(function(p) {
					return <Friends.ProjectItem key={p.id} project={p} activates="friend-project-dropdown"/>
				}) : ""
			}
			</div>
		)
	},
});

Friends.ProjectItem = React.createClass({
	styles: {
		container: {
			flex: "0 auto",
			margin: "8px",
			position: "relative",
		},
		avatar: {
			display: "inline-block",
			width: "64px",
			margin: "0 8px",
			border: "2px solid #808080",
		},
		projectInfo: {
			display: "inline-block",
			margin: "0",
			verticalAlign: "top",
		},
		dropdownButton: {
			cursor: "pointer",
		},
	},
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.dropdownButton)).dropdown({
			inDuration: 300,
			outDuration: 225,
			constrain_width: false,
			gutter: 0,
			belowOrigin: true,
		});
	},
	render: function() {
		var project = this.props.project;
		return (
			<div className="item" style={this.styles.container}>
				<img src={project.imageURL} style={this.styles.avatar} />
				<p style={this.styles.projectInfo}>
					{project.title}
					<span ref="dropdownButton" style={this.styles.dropdownButton} data-activates={this.props.activates} onClick={this.handleClick}> &#8964;</span><br/>
					Online
				</p>
				<Friends.ProjectDropdown />
			</div>
		)
	},
	handleClick: function(e) {
		dispatcher.dispatch({type: "openProjectDropdown", data: this.props.project});
	},
});

Friends.ProjectDropdown = React.createClass({
	project: null,
	componentDidMount: function() {
		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "openProjectDropdown":
				this.project = payload.data;
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		return (
			<ul id="friend-project-dropdown" className="dropdown-content">
				<li><a href="#" onClick={this.handleOpenChat}>Send Message</a></li>
				<li><a href="#">View Project</a></li>
			</ul>
		)
	},
	handleOpenChat: function(e) {
		dispatcher.dispatch({
			type: "openProjectChat",
			data: this.project,
		});

		e.preventDefault();
	},
});

Friends.ProjectChat = React.createClass({
	getInitialState: function() {
		return {messages: []};
	},
	styles: {
		container: {
			position: "absolute",
			width: "500px",
			height: "300px",
			minWidth: "500px",
			minHeight: "300px",
			top: "calc(80% - 400px)",
			left: "calc(80% - 600px)",
			pointerEvents: "all",
		},
		content: {
			display: "flex",
			flexDirection: "column",
			overflowY: "auto",
		},
	},
	componentDidMount: function() {
		var user = this.props.user;
		var project = this.props.project;

		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "newChatMessage":
				var m = payload.data;
				if (!(m.channelType == "project" && m.channelID == project.id)) {
					break;
				}

				var startID = 0;
				var messages = this.state.messages;
				if (messages) {
					if (messages.length > 0 ) {
						startID = messages[messages.length - 1].id;
					}
				}
				OI.getChatMessages({channelID: project.id, channelType: "project", startID: startID, count: -1});
				break;
			case "getChatMessagesDone":
				var data = payload.data.data;
				if (data) {
					if (data.length > 0) {
						if (!(data[0].channelType == "project" && data[0].channelID == project.id)) {
							break;
						}
					}
				}

				var messages = this.state.messages;
				if (messages.length > 0 && data) {
					messages = messages.concat(data);
					this.props.playChatSound();
					this.refs.list.scrollToBottom();
				} else if (messages.length == 0) {
					messages = data;
				}
				this.setState({messages: messages});
				break;
			}
		}.bind(this));

		$(React.findDOMNode(this)).draggable().resizable();

		OI.getChatMessages({channelID: project.id, channelType: "project", count: -1});
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var user = this.props.user;
		var project = this.props.project;
		return (
			<Window className="chat" style={this.styles.container}>
				<Window.Header onClose={this.handleClose}>{project.title}</Window.Header>
				<Window.Content style={this.styles.content}>
					<Friends.ProjectChat.Header project={project} />
					<Friends.ProjectChat.List ref="list" user={user} project={project} messages={this.state.messages} />
					<Friends.ProjectChat.Input user={user} project={project} />
				</Window.Content>
			</Window>
		)
	},
	handleClose: function() {
		dispatcher.dispatch({type: "closeProjectChat", data: this.props.windowID});
	},
});

Friends.ProjectChat.Header = React.createClass({
	styles: {
		container: {
			margin: "8px",
		},
		avatar: {
			display: "inline-block",
			width: "64px",
			border: "2px solid #808080",
		},
		projectInfo: {
			display: "inline-block",
			margin: "0 8px",
			verticalAlign: "top",
		},
	},
	render: function() {
		var project = this.props.project;
		return (
			<div className="item" style={this.styles.container}>
				<img src={project.imageURL} style={this.styles.avatar} />
				<p style={this.styles.projectInfo}>
					{project.title}
					<span> &#8964;</span><br/>
					Online
				</p>
			</div>
		)
	},
});

Friends.ProjectChat.List = React.createClass({
	styles: {
		container: {
			flex: "1 auto",
			border: "1px solid #f7f7f7",
			margin: "8px",
			background: "linear-gradient(#f0f0f0, #ffffff)",
			overflowY: "scroll",
		},
		text: {
			padding: "0",
			margin: "0 8px",
		},
	},
	render: function() {
		return (
			<div className="list" style={this.styles.container}>{
				this.props.messages ?
				this.props.messages.map(function(m) {
					return <p style={this.styles.text}><strong>{m.username}: </strong>{m.text}</p>
				}.bind(this)) : ""
			}</div>
		)
	},
	scrollToBottom: function() {
		var list = React.findDOMNode(this);
		$(list).scrollTop(list.scrollHeight);
	},
});

Friends.ProjectChat.Input = React.createClass({
	styles: {
		container: {
			display: "flex",
			margin: "16px 8px",
		},
		textarea: {
			minHeight: "100px",
			maxHeight: "100px",
		},
	},
	render: function() {
		return (
			<form style={this.styles.container}>
				<textarea ref="textarea" style={this.styles.textarea} onKeyPress={this.handleKeyPress}></textarea>
				<button onClick={this.handleClick}>Send</button>
			</form>
		)
	},
	handleKeyPress: function(e) {
		if (e.charCode == 13) {
			this.sendMessage();
			e.preventDefault();
		}
	},
	handleClick: function(e) {
		this.sendMessage();
		e.preventDefault();
	},
	sendMessage: function() {
		var textarea = React.findDOMNode(this.refs.textarea);

		OI.postChatMessage({
			userID: this.props.user.id,
			channelID: this.props.project.id,
			channelType: "project",
			text: textarea.value,
		});

		textarea.value = '';
	},
});
