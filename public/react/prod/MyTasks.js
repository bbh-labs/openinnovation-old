var MyTasks = React.createClass({displayName: "MyTasks",
	render: function() {
		return (
			React.createElement("div", {className: "my-tasks"}, 
				React.createElement("h4", {className: "my-tasks__title"}, "My Tasks"), 
				React.createElement("ul", {className: "my-tasks__list"}, 
					React.createElement(MyTasks.Item, null), 
					React.createElement(MyTasks.Item, null), 
					React.createElement(MyTasks.Item, null)
				)
			)
		)
	},
});

MyTasks.Item = React.createClass({displayName: "Item",
	render: function() {
		return (
			React.createElement("li", {className: "my-tasks__item"}, 
				React.createElement("h6", null, React.createElement("strong", null, "Lorem ipsum dolor sit amet")), 
				React.createElement("p", null, "In sagittis, lorem a auctor sollicitudin, enim diam tempus diam, vitae egestas lectus nec libero")
			)
		)
	},
});
