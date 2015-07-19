var MyTasks = React.createClass({
	render: function() {
		return (
			<div className="my-tasks">
				<h4 className="my-tasks__title">My Tasks</h4>
				<ul className="my-tasks__list">
					<MyTasks.Item />
					<MyTasks.Item />
					<MyTasks.Item />
				</ul>
			</div>
		)
	},
});

MyTasks.Item = React.createClass({
	render: function() {
		return (
			<li className="my-tasks__item">
				<h6><strong>Lorem ipsum dolor sit amet</strong></h6>
				<p>In sagittis, lorem a auctor sollicitudin, enim diam tempus diam, vitae egestas lectus nec libero</p>
			</li>
		)
	},
});
