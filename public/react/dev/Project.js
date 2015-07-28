var Project = React.createClass({
	mixins: [ State, Navigation ],
	getInitialState: function() {
		return {project: null};
	},
	componentDidMount: function() {
		OI.project({
			projectID: this.getParams().projectID,
		});

		dispatcher.register(function(payload) {
			switch (payload.type) {
			case "projectDone":
				this.setState({project: payload.data.data});
				break;
			case "projectFail":
				this.transitionTo("dashboard");
				break;
			}
		}.bind(this));
	},
	render: function() {
		var project = this.state.project;
		if (!project) {
			return <div/>
		}
		return (
			<div className="project">
				<Header />
				<main>
					<Project.Cover project={project} />
					<Project.Content project={project} />
				</main>
			</div>
		)
	},
});

Project.Cover = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.parallax)).parallax();
	},
	render: function() {
		var project = this.props.project;
		return (
			<div className="parallax-container">
				<div ref="parallax" className="parallax">
					<img src={project.imageURL} />
				</div>
				<div className="parallax-overlay valign-wrapper">
					<div className="valign">
						<Project.Cover.Title project={project} />
						<h4 className="text-center">{project.tagline}</h4>
					</div>
				</div>
			</div>
		)
	},
});

Project.Cover.Title = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.title));
	},
	render: function() {
		var project = this.props.project;
		return <h1 className="text-center">{project.title}</h1>
	},
});

Project.Content = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.tabs)).tabs();
	},
	render: function() {
		var project = this.props.project;
		return (
			<div className="row container">
				<div className="col s12">
					<ul className="tabs" ref="tabs">
						<li className="tab col s3"><a href="#project-overview">Overview</a></li>
						<li className="tab col s3"><a href="#project-tasks">Tasks</a></li>
						<li className="tab col s3"><a href="#project-milestones">Milestones</a></li>
						<li className="tab col s3"><a href="#project-collaborators">Collaborators</a></li>
					</ul>
				</div>
				<Project.Overview project={project}/>
				<Project.Tasks />
				<Project.Milestones />
				<Project.Collaborators />
			</div>
		)
	},
});

Project.Overview = React.createClass({
	getInitialState: function() {
		return {editMode: false};
	},
	render: function() {
		var project = this.props.project;
		var editMode = this.state.editMode;
		return (
			<div id="project-overview" className="col s12">
				<div className="main col s12 m8 l9">
					<div className={classNames("card", editMode && "blue white-text")}>
						<div className="card-content">
							<h5>Description
								<a href="#" onClick={this.handleClick}>
									<i className={classNames("material-icons right", editMode && "white-text")}>
										{editMode ? "done" : "mode edit"}
									</i>
								</a>
							</h5>
							{this.descriptionElement()}
						</div>
					</div>
				</div>
				<div className="sidebar col s12 m4 l3">
					<div className="card small">
						<div className="card-image">
							<h5 className="card-title">Next Deadline</h5>
						</div>
						<div className="card-content">
							<h1>59</h1>
							<p>days left</p>
						</div>
					</div>
				</div>
			</div>
		)
	},
	handleClick: function(e) {
		var editMode = this.state.editMode;
		if (editMode) {
			var description = React.findDOMNode(this.refs.description).innerHTML;
			OI.updateProject({
				projectID: this.props.project.id,
				description: description,
			});
		}
		this.setState({editMode: !editMode});
	
		e.preventDefault();
	},
	descriptionElement: function() {
		if (this.state.editMode) {
			return <p className="no-outline" ref="description" contentEditable>{this.props.project.description}</p>
		}
		return <p ref="description">{this.props.project.description}</p>
	},
});

Project.Tasks = React.createClass({
	render: function() {
		return (
			<div id="project-tasks" className="col s12">
				<div className="main col l9">
					<div className="input-field col s12 m4">
						<input id="task-search" type="text" required />
						<label htmlFor="task-search">Search</label>
					</div>
					<div className="input-field col s12 m4">
						<select className="browser-default">
							<option value="" selected>Any type</option>
							<option value="artist">Artist</option>
							<option value="copywriter">Copywriter</option>
							<option value="designer">Designer</option>
							<option value="engineer">Engineer</option>
							<option value="manager">Manager</option>
							<option value="planner">Planner</option>
							<option value="producer">Producer</option>
						</select>
					</div>
					<div className="input-field col s12 m4">
						<select className="browser-default">
							<option value="" selected>Any urgency</option>
							<option value="relaxed">Least urgent first</option>
							<option value="urgent">Most urgent first</option>
						</select>
					</div>
					<ul className="collection col s12">
						<li className="collection-item avatar">
							<img className="circle" src="images/profile-pics/1.jpg" />
							<span className="title">Title</span>
							<p>First line <br/>
							   Second line
							</p>
							<a href="#" className="secondary-content"><i className="material-icons">send</i></a>
						</li>
						<li className="collection-item avatar">
							<img className="circle" src="images/profile-pics/1.jpg" />
							<span className="title">Title</span>
							<p>First line <br/>
							   Second line
							</p>
							<a href="#" className="secondary-content"><i className="material-icons">send</i></a>
						</li>
						<li className="collection-item avatar">
							<img className="circle" src="images/profile-pics/1.jpg" />
							<span className="title">Title</span>
							<p>First line <br/>
							   Second line
							</p>
							<a href="#" className="secondary-content"><i className="material-icons">send</i></a>
						</li>
					</ul>
				</div>
				<div className="sidebar col s12 m4 l3">
					<div className="card small">
						<div className="card-image">
							<h5 className="card-title">Completed</h5>
						</div>
						<div className="card-content">
							<h1>40/56</h1>
							<p>tasks</p>
						</div>
					</div>
				</div>
			</div>
		)
	},
});

Project.Milestones = React.createClass({
	componentDidMount: function() {
		var timelineBlocks = $('.cd-timeline-block'),
			offset = 0.8;

		//hide timeline blocks which are outside the viewport
		hideBlocks(timelineBlocks, offset);

		//on scolling, show/animate timeline blocks when enter the viewport
		$(window).on('scroll', function(){
			(!window.requestAnimationFrame) 
			? setTimeout(function(){ showBlocks(timelineBlocks, offset); }, 100)
			: window.requestAnimationFrame(function(){ showBlocks(timelineBlocks, offset); });
		});

		function hideBlocks(blocks, offset) {
			blocks.each(function() {
				( $(this).offset().top > $(window).scrollTop()+$(window).height()*offset ) && $(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden');
			});
		}

		function showBlocks(blocks, offset) {
			blocks.each(function(){
				( $(this).offset().top <= $(window).scrollTop()+$(window).height()*offset && $(this).find('.cd-timeline-img').hasClass('is-hidden') ) && $(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in');
			});
		}
	},
	render: function() {
		return (
			<div id="project-milestones" className="col s12">
				<section id="cd-timeline" className="cd-container">
					<div className="cd-timeline-block">
						<div className="cd-timeline-img cd-picture">
							<img src="vertical-timeline/img/cd-icon-picture.svg" alt="Picture" />
						</div>

						<div className="cd-timeline-content">
							<h2>Title of section 1</h2>
							<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat iure tempora laudantium ipsa ad debitis unde? Iste voluptatibus minus veritatis qui ut.</p>
							<a href="#0" className="cd-read-more">Read more</a>
							<span className="cd-date">Jan 14</span>
						</div>
					</div>

					<div className="cd-timeline-block">
						<div className="cd-timeline-img cd-movie">
							<img src="vertical-timeline/img/cd-icon-movie.svg" alt="Movie" />
						</div>

						<div className="cd-timeline-content">
							<h2>Title of section 2</h2>
							<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat iure tempora laudantium ipsa ad debitis unde?</p>
							<a href="#0" className="cd-read-more">Read more</a>
							<span className="cd-date">Jan 18</span>
						</div>
					</div>

					<div className="cd-timeline-block">
						<div className="cd-timeline-img cd-picture">
							<img src="vertical-timeline/img/cd-icon-picture.svg" alt="Picture" />
						</div>

						<div className="cd-timeline-content">
							<h2>Title of section 3</h2>
							<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Excepturi, obcaecati, quisquam id molestias eaque asperiores voluptatibus cupiditate error assumenda delectus odit similique earum voluptatem doloremque dolorem ipsam quae rerum quis. Odit, itaque, deserunt corporis vero ipsum nisi eius odio natus ullam provident pariatur temporibus quia eos repellat consequuntur perferendis enim amet quae quasi repudiandae sed quod veniam dolore possimus rem voluptatum eveniet eligendi quis fugiat aliquam sunt similique aut adipisci.</p>
							<a href="#0" className="cd-read-more">Read more</a>
							<span className="cd-date">Jan 24</span>
						</div>
					</div>

					<div className="cd-timeline-block">
						<div className="cd-timeline-img cd-location">
							<img src="vertical-timeline/img/cd-icon-location.svg" alt="Location" />
						</div>

						<div className="cd-timeline-content">
							<h2>Title of section 4</h2>
							<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat iure tempora laudantium ipsa ad debitis unde? Iste voluptatibus minus veritatis qui ut.</p>
							<a href="#0" className="cd-read-more">Read more</a>
							<span className="cd-date">Feb 14</span>
						</div>
					</div>

					<div className="cd-timeline-block">
						<div className="cd-timeline-img cd-location">
							<img src="vertical-timeline/img/cd-icon-location.svg" alt="Location" />
						</div>

						<div className="cd-timeline-content">
							<h2>Title of section 5</h2>
							<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum.</p>
							<a href="#0" className="cd-read-more">Read more</a>
							<span className="cd-date">Feb 18</span>
						</div>
					</div>

					<div className="cd-timeline-block">
						<div className="cd-timeline-img cd-movie">
							<img src="vertical-timeline/img/cd-icon-movie.svg" alt="Movie" />
						</div>

						<div className="cd-timeline-content">
							<h2>Final Section</h2>
							<p>This is the content of the last section</p>
							<span className="cd-date">Feb 26</span>
						</div>
					</div>
				</section>
			</div>
		)
	},
});

Project.Collaborators = React.createClass({
	render: function() {
		return (
			<div id="project-collaborators" className="col s12">
				<div className="main col l9">
					<div className="input-field col s12 m4">
						<input id="task-search" type="text" required />
						<label htmlFor="task-search">Search</label>
					</div>
					<div className="input-field col s12 m4">
						<select className="browser-default">
							<option value="" selected>Any type</option>
							<option value="artist">Artist</option>
							<option value="copywriter">Copywriter</option>
							<option value="designer">Designer</option>
							<option value="engineer">Engineer</option>
							<option value="manager">Manager</option>
							<option value="planner">Planner</option>
							<option value="producer">Producer</option>
						</select>
					</div>
					<ul className="collection col s12">
						<li className="collection-item avatar">
							<img className="circle" src="images/profile-pics/1.jpg" />
							<span className="title">Title</span>
							<p>First line <br/>
							   Second line
							</p>
							<a href="#" className="secondary-content"><i className="material-icons">send</i></a>
						</li>
						<li className="collection-item avatar">
							<img className="circle" src="images/profile-pics/1.jpg" />
							<span className="title">Title</span>
							<p>First line <br/>
							   Second line
							</p>
							<a href="#" className="secondary-content"><i className="material-icons">send</i></a>
						</li>
						<li className="collection-item avatar">
							<img className="circle" src="images/profile-pics/1.jpg" />
							<span className="title">Title</span>
							<p>First line <br/>
							   Second line
							</p>
							<a href="#" className="secondary-content"><i className="material-icons">send</i></a>
						</li>
					</ul>
				</div>
				<div className="sidebar col s12 m4 l3">
					<div className="card small">
						<div className="card-image">
							<h5 className="card-title">Collaborators size</h5>
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
});
