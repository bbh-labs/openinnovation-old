var routes = (
	React.createElement(Route, {handler: App, path: "/"}, 
		React.createElement(DefaultRoute, {handler: Intro, name: "intro"}), 
		React.createElement(Route, {handler: Login, name: "login"}), 
		React.createElement(Route, {handler: Register, name: "register"}), 
		React.createElement(Route, {handler: ForgotPassword, name: "forgotpassword"}), 
		React.createElement(Route, {handler: Dashboard, name: "dashboard"}), 
		React.createElement(Route, {handler: Project, name: "project"}), 
		React.createElement(Route, {handler: NewProject, name: "new-project"}), 
		React.createElement(Route, {handler: Profile, name: "profile"}), 
		React.createElement(Route, {handler: Admin, name: "admin"})
	)
);

ReactRouter.run(routes, function(Handler) {
	React.render(React.createElement(Handler, null), document.getElementById("root"));
});
