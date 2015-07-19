var Project = React.createClass({displayName: "Project",
	mixins: [ State ],
	render: function() {
		return (
			React.createElement("div", {className: "project"}, 
				React.createElement(Header, null), 
				React.createElement("main", null, 
					React.createElement(Project.Cover, null), 
					React.createElement(Project.Content, null)
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
		return (
			React.createElement("div", {className: "parallax-container"}, 
				React.createElement("div", {ref: "parallax", className: "parallax"}, 
					React.createElement("img", {src: "images/1.jpg"})
				), 
				React.createElement("div", {className: "parallax-overlay valign-wrapper"}, 
					React.createElement("div", {className: "valign"}, 
						React.createElement("h1", {className: "text-center"}, "Test"), 
						React.createElement("h4", {className: "text-center"}, "Lorem ipsum dolor sit amet consectetur.")
					)
				)
			)
		)
	},
});

Project.Content = React.createClass({displayName: "Content",
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.tabs)).tabs();
	},
	render: function() {
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
				React.createElement(Project.Overview, null), 
				React.createElement(Project.Tasks, null), 
				React.createElement(Project.Milestones, null), 
				React.createElement(Project.Collaborators, null)
			)
		)
	},
});

Project.Overview = React.createClass({displayName: "Overview",
	render: function() {
		return (
			React.createElement("div", {id: "project-overview", className: "col s12"}, 
				React.createElement("div", {className: "main col s12 m8 l9"}, 
					React.createElement("div", {className: "card"}, 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("h5", null, "Description ", React.createElement("a", {href: "#"}, React.createElement("i", {className: "material-icons right"}, "mode edit"))), 
							React.createElement("p", null, "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus efficitur tempus nisi eu iaculis. Donec eget bibendum ante. Suspendisse cursus eu urna at finibus. Fusce quis interdum massa. Aenean sit amet nulla eu nulla congue sagittis at eu sapien. Nam ultricies ex eu enim faucibus pretium. Nam et nisi eu nibh egestas finibus. Duis vel consectetur metus. Vivamus metus tellus, pretium at pellentesque quis, tincidunt sit amet lectus. Etiam quis nunc ut magna dapibus tincidunt. Mauris non magna ante. Nam ullamcorper, metus sit amet cursus dapibus, sapien augue imperdiet nisi, et auctor lectus neque quis risus. Suspendisse posuere tincidunt ipsum sit amet posuere. Proin elementum, quam a vestibulum semper, elit mi convallis sem, maximus vulputate tortor nisi finibus magna. Etiam sit amet risus vitae eros auctor consectetur." + ' ' +

							"Duis tempus erat tortor, a dapibus quam dapibus a. Aenean efficitur orci ac posuere dignissim. Sed aliquam erat a neque semper, et pretium felis laoreet. Integer nec nunc nec ante porta placerat. Cras eu dolor felis. Donec facilisis nec felis blandit porttitor. Suspendisse molestie accumsan tortor varius vestibulum. Sed placerat lobortis neque. Etiam at turpis ac orci vulputate consequat. Praesent accumsan efficitur diam, ut sollicitudin mauris."
							)
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
});

Project.Tasks = React.createClass({displayName: "Tasks",
	render: function() {
		return (
			React.createElement("div", {id: "project-tasks", className: "col s12"}, 
				React.createElement("div", {className: "main col l9"}, 
					React.createElement("div", {className: "input-field col s12 m4"}, 
						React.createElement("input", {id: "task-search", type: "text", required: true}), 
						React.createElement("label", {htmlFor: "task-search"}, "Search")
					), 
					React.createElement("div", {className: "input-field col s12 m4"}, 
						React.createElement("select", {className: "browser-default"}, 
							React.createElement("option", {value: "", selected: true}, "Any type"), 
							React.createElement("option", {value: "artist"}, "Artist"), 
							React.createElement("option", {value: "copywriter"}, "Copywriter"), 
							React.createElement("option", {value: "designer"}, "Designer"), 
							React.createElement("option", {value: "engineer"}, "Engineer"), 
							React.createElement("option", {value: "manager"}, "Manager"), 
							React.createElement("option", {value: "planner"}, "Planner"), 
							React.createElement("option", {value: "producer"}, "Producer")
						)
					), 
					React.createElement("div", {className: "input-field col s12 m4"}, 
						React.createElement("select", {className: "browser-default"}, 
							React.createElement("option", {value: "", selected: true}, "Any urgency"), 
							React.createElement("option", {value: "relaxed"}, "Least urgent first"), 
							React.createElement("option", {value: "urgent"}, "Most urgent first")
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
							React.createElement("h5", {className: "card-title"}, "Completed")
						), 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("h1", null, "40/56"), 
							React.createElement("p", null, "tasks")
						)
					)
				)
			)
		)
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
						React.createElement("select", {className: "browser-default"}, 
							React.createElement("option", {value: "", selected: true}, "Any type"), 
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
