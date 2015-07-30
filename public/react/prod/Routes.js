var routes = (
	React.createElement(Route, {handler: App}, 
		React.createElement(Route, {handler: GuestPage}, 
			React.createElement(Route, {handler: Intro, name: "intro", path: "/"}), 
			React.createElement(Route, {handler: Login, name: "login"}), 
			React.createElement(Route, {handler: Register, name: "register"})
		), 
		React.createElement(Route, {handler: UserPage}, 
			React.createElement(Route, {handler: Dashboard, name: "dashboard"}), 
			React.createElement(Route, {handler: ForgotPassword, name: "forgotpassword"}), 
			React.createElement(Route, {handler: Project, name: "project", path: "/project/:projectID"}), 
			React.createElement(Route, {handler: EditProject, name: "edit-project", path: "/project/:projectID/edit"}), 
			React.createElement(Route, {handler: NewProject, name: "new-project"}), 
			React.createElement(Route, {handler: User, name: "user", path: "/user/:userID"}), 
			React.createElement(Route, {handler: Admin, name: "admin"})
		)
	)
);

ReactRouter.run(routes, function(Handler) {
	React.render(React.createElement(Handler, null), document.getElementById("root"));
});
