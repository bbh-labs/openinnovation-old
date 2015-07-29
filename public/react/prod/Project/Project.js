var Project = React.createClass({displayName: "Project",
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
			return React.createElement("div", null)
		}
		return (
			React.createElement("div", {className: "project"}, 
				React.createElement(Header, null), 
				React.createElement("main", null, 
					React.createElement(Project.Cover, {project: project}), 
					React.createElement(Project.Content, {project: project})
				)
			)
		)
	},
});

Project.Cover = React.createClass({displayName: "Cover",
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.parallax)).parallax();
	},
	render: function() {
		var project = this.props.project;
		return (
			React.createElement("div", {className: "parallax-container"}, 
				React.createElement("div", {ref: "parallax", className: "parallax"}, 
					React.createElement("img", {src: project.imageURL})
				), 
				React.createElement("div", {className: "parallax-overlay valign-wrapper"}, 
					React.createElement("div", {className: "valign"}, 
						React.createElement(Project.Cover.Title, {project: project}), 
						React.createElement("h4", {className: "text-center"}, project.tagline)
					)
				)
			)
		)
	},
});

Project.Cover.Title = React.createClass({displayName: "Title",
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.title));
	},
	render: function() {
		var project = this.props.project;
		return React.createElement("h1", {className: "text-center"}, project.title)
	},
});

Project.Content = React.createClass({displayName: "Content",
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.tabs)).tabs();
	},
	render: function() {
		var project = this.props.project;
		return (
			React.createElement("div", {className: "row container"}, 
				React.createElement("div", {className: "col s12"}, 
					React.createElement("ul", {className: "tabs", ref: "tabs"}, 
						React.createElement("li", {className: "tab col s3"}, React.createElement("a", {href: "#project-overview"}, "Overview")), 
						React.createElement("li", {className: "tab col s3"}, React.createElement("a", {href: "#project-tasks"}, "Tasks")), 
						React.createElement("li", {className: "tab col s3"}, React.createElement("a", {href: "#project-milestones"}, "Milestones")), 
						React.createElement("li", {className: "tab col s3"}, React.createElement("a", {href: "#project-collaborators"}, "Collaborators"))
					)
				), 
				React.createElement(Project.Overview, {project: project}), 
				React.createElement(Project.Tasks, {project: project}), 
				React.createElement(Project.Milestones, {project: project}), 
				React.createElement(Project.Collaborators, {project: project})
			)
		)
	},
});

Project.Overview = React.createClass({displayName: "Overview",
	getInitialState: function() {
		return {editMode: false};
	},
	render: function() {
		var project = this.props.project;
		var editMode = this.state.editMode;
		return (
			React.createElement("div", {id: "project-overview", className: "col s12"}, 
				React.createElement("div", {className: "main col s12 m8 l9"}, 
					React.createElement("div", {className: classNames("card", editMode && "blue white-text")}, 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("h5", null, "Description", 
								React.createElement("a", {href: "#", onClick: this.handleClick}, 
									React.createElement("i", {className: classNames("material-icons right", editMode && "white-text")}, 
										editMode ? "done" : "mode edit"
									)
								)
							), 
							this.descriptionElement()
						)
					)
				), 
				React.createElement("div", {className: "sidebar col s12 m4 l3"}, 
					React.createElement("div", {className: "card small"}, 
						React.createElement("div", {className: "card-image"}, 
							React.createElement("h5", {className: "card-title"}, "Next Deadline")
						), 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("h1", null, "59"), 
							React.createElement("p", null, "days left")
						)
					)
				)
			)
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
			return React.createElement("p", {className: "no-outline", ref: "description", contentEditable: true}, this.props.project.description)
		}
		return React.createElement("p", {ref: "description"}, this.props.project.description)
	},
});

Project.Milestones = React.createClass({displayName: "Milestones",
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
			React.createElement("div", {id: "project-milestones", className: "col s12"}, 
				React.createElement("section", {id: "cd-timeline", className: "cd-container"}, 
					React.createElement("div", {className: "cd-timeline-block"}, 
						React.createElement("div", {className: "cd-timeline-img cd-picture"}, 
							React.createElement("img", {src: "vertical-timeline/img/cd-icon-picture.svg", alt: "Picture"})
						), 

						React.createElement("div", {className: "cd-timeline-content"}, 
							React.createElement("h2", null, "Title of section 1"), 
							React.createElement("p", null, "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat iure tempora laudantium ipsa ad debitis unde? Iste voluptatibus minus veritatis qui ut."), 
							React.createElement("a", {href: "#0", className: "cd-read-more"}, "Read more"), 
							React.createElement("span", {className: "cd-date"}, "Jan 14")
						)
					), 

					React.createElement("div", {className: "cd-timeline-block"}, 
						React.createElement("div", {className: "cd-timeline-img cd-movie"}, 
							React.createElement("img", {src: "vertical-timeline/img/cd-icon-movie.svg", alt: "Movie"})
						), 

						React.createElement("div", {className: "cd-timeline-content"}, 
							React.createElement("h2", null, "Title of section 2"), 
							React.createElement("p", null, "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat iure tempora laudantium ipsa ad debitis unde?"), 
							React.createElement("a", {href: "#0", className: "cd-read-more"}, "Read more"), 
							React.createElement("span", {className: "cd-date"}, "Jan 18")
						)
					), 

					React.createElement("div", {className: "cd-timeline-block"}, 
						React.createElement("div", {className: "cd-timeline-img cd-picture"}, 
							React.createElement("img", {src: "vertical-timeline/img/cd-icon-picture.svg", alt: "Picture"})
						), 

						React.createElement("div", {className: "cd-timeline-content"}, 
							React.createElement("h2", null, "Title of section 3"), 
							React.createElement("p", null, "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Excepturi, obcaecati, quisquam id molestias eaque asperiores voluptatibus cupiditate error assumenda delectus odit similique earum voluptatem doloremque dolorem ipsam quae rerum quis. Odit, itaque, deserunt corporis vero ipsum nisi eius odio natus ullam provident pariatur temporibus quia eos repellat consequuntur perferendis enim amet quae quasi repudiandae sed quod veniam dolore possimus rem voluptatum eveniet eligendi quis fugiat aliquam sunt similique aut adipisci."), 
							React.createElement("a", {href: "#0", className: "cd-read-more"}, "Read more"), 
							React.createElement("span", {className: "cd-date"}, "Jan 24")
						)
					), 

					React.createElement("div", {className: "cd-timeline-block"}, 
						React.createElement("div", {className: "cd-timeline-img cd-location"}, 
							React.createElement("img", {src: "vertical-timeline/img/cd-icon-location.svg", alt: "Location"})
						), 

						React.createElement("div", {className: "cd-timeline-content"}, 
							React.createElement("h2", null, "Title of section 4"), 
							React.createElement("p", null, "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat iure tempora laudantium ipsa ad debitis unde? Iste voluptatibus minus veritatis qui ut."), 
							React.createElement("a", {href: "#0", className: "cd-read-more"}, "Read more"), 
							React.createElement("span", {className: "cd-date"}, "Feb 14")
						)
					), 

					React.createElement("div", {className: "cd-timeline-block"}, 
						React.createElement("div", {className: "cd-timeline-img cd-location"}, 
							React.createElement("img", {src: "vertical-timeline/img/cd-icon-location.svg", alt: "Location"})
						), 

						React.createElement("div", {className: "cd-timeline-content"}, 
							React.createElement("h2", null, "Title of section 5"), 
							React.createElement("p", null, "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum."), 
							React.createElement("a", {href: "#0", className: "cd-read-more"}, "Read more"), 
							React.createElement("span", {className: "cd-date"}, "Feb 18")
						)
					), 

					React.createElement("div", {className: "cd-timeline-block"}, 
						React.createElement("div", {className: "cd-timeline-img cd-movie"}, 
							React.createElement("img", {src: "vertical-timeline/img/cd-icon-movie.svg", alt: "Movie"})
						), 

						React.createElement("div", {className: "cd-timeline-content"}, 
							React.createElement("h2", null, "Final Section"), 
							React.createElement("p", null, "This is the content of the last section"), 
							React.createElement("span", {className: "cd-date"}, "Feb 26")
						)
					)
				)
			)
		)
	},
});

Project.Collaborators = React.createClass({displayName: "Collaborators",
	render: function() {
		return (
			React.createElement("div", {id: "project-collaborators", className: "col s12"}, 
				React.createElement("div", {className: "main col l9"}, 
					React.createElement("div", {className: "input-field col s12 m4"}, 
						React.createElement("input", {id: "task-search", type: "text", required: true}), 
						React.createElement("label", {htmlFor: "task-search"}, "Search")
					), 
					React.createElement("div", {className: "input-field col s12 m4"}, 
						React.createElement("select", {className: "browser-default", defaultValue: ""}, 
							React.createElement("option", {value: ""}, "Any type"), 
							React.createElement("option", {value: "artist"}, "Artist"), 
							React.createElement("option", {value: "copywriter"}, "Copywriter"), 
							React.createElement("option", {value: "designer"}, "Designer"), 
							React.createElement("option", {value: "engineer"}, "Engineer"), 
							React.createElement("option", {value: "manager"}, "Manager"), 
							React.createElement("option", {value: "planner"}, "Planner"), 
							React.createElement("option", {value: "producer"}, "Producer")
						)
					), 
					React.createElement("ul", {className: "collection col s12"}, 
						React.createElement("li", {className: "collection-item avatar"}, 
							React.createElement("img", {className: "circle", src: "images/profile-pics/1.jpg"}), 
							React.createElement("span", {className: "title"}, "Title"), 
							React.createElement("p", null, "First line ", React.createElement("br", null), 
							   "Second line"
							), 
							React.createElement("a", {href: "#", className: "secondary-content"}, React.createElement("i", {className: "material-icons"}, "send"))
						), 
						React.createElement("li", {className: "collection-item avatar"}, 
							React.createElement("img", {className: "circle", src: "images/profile-pics/1.jpg"}), 
							React.createElement("span", {className: "title"}, "Title"), 
							React.createElement("p", null, "First line ", React.createElement("br", null), 
							   "Second line"
							), 
							React.createElement("a", {href: "#", className: "secondary-content"}, React.createElement("i", {className: "material-icons"}, "send"))
						), 
						React.createElement("li", {className: "collection-item avatar"}, 
							React.createElement("img", {className: "circle", src: "images/profile-pics/1.jpg"}), 
							React.createElement("span", {className: "title"}, "Title"), 
							React.createElement("p", null, "First line ", React.createElement("br", null), 
							   "Second line"
							), 
							React.createElement("a", {href: "#", className: "secondary-content"}, React.createElement("i", {className: "material-icons"}, "send"))
						)
					)
				), 
				React.createElement("div", {className: "sidebar col s12 m4 l3"}, 
					React.createElement("div", {className: "card small"}, 
						React.createElement("div", {className: "card-image"}, 
							React.createElement("h5", {className: "card-title"}, "Collaborators size")
						), 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("h1", null, "9"), 
							React.createElement("p", null, "people")
						)
					)
				)
			)
		)
	},
});
