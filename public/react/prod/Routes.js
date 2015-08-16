var routes = (
	React.createElement(Route, {handler: App}, 
		React.createElement(Route, {handler: GuestPage}, 
			React.createElement(Route, {handler: Intro, name: "intro", path: "/"})
		), 
		React.createElement(Route, {handler: UserPage}, 
			React.createElement(Route, {handler: Dashboard, name: "dashboard"}), 
			React.createElement(Route, {handler: Project, name: "project", path: "/project/:projectID"}), 
			React.createElement(Route, {handler: EditProject, name: "edit-project", path: "/project/:projectID/edit"}), 
			React.createElement(Route, {handler: NewProject, name: "new-project", path: "/project"}), 
			React.createElement(Route, {handler: CreateTask, name: "create-task", path: "/project/:projectID/task"}), 
			React.createElement(Route, {handler: ViewTask, name: "view-task", path: "/project/:projectID/task/:taskID"}), 
			React.createElement(Route, {handler: Workers, name: "task_workers", path: "/project/:projectID/task/:taskID/workers"}), 
			React.createElement(Route, {handler: User, name: "user", path: "/user/:userID"}), 
			React.createElement(Route, {handler: Settings, name: "settings"})
		)
	)
);

ReactRouter.run(routes, function(Handler) {
	React.render(React.createElement(Handler, null), document.getElementById("root"));
});
