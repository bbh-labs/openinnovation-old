var routes = (
	<Route handler={App}>
		<Route handler={GuestPage}>
			<Route handler={Intro} name="intro" path="/" />
		</Route>
		<Route handler={UserPage}>
			<Route handler={Dashboard} name="dashboard" />
			<Route handler={Project} name="project" path="/project/:projectID" />
			<Route handler={EditProject} name="edit-project" path="/project/:projectID/edit" />
			<Route handler={NewProject} name="new-project" path="/project" />
			<Route handler={CreateTask} name="create-task" path="/task" />
			<Route handler={ViewTask} name="view-task" path="/task/:taskID" />
			<Route handler={Workers} name="task" path="/task/:taskID/workers" />
			<Route handler={User} name="user" path="/user/:userID" />
			<Route handler={Settings} name="settings" />
		</Route>
	</Route>
);

ReactRouter.run(routes, function(Handler) {
	React.render(<Handler/>, document.getElementById("root"));
});
