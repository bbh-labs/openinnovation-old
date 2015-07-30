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
