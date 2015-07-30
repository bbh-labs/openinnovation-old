var routes = (
	<Route handler={App}>
		<Route handler={GuestPage}>
			<Route handler={Intro} name="intro" path="/" />
			<Route handler={Login} name="login" />
			<Route handler={Register} name="register" />
		</Route>
		<Route handler={UserPage}>
			<Route handler={Dashboard} name="dashboard" />
			<Route handler={ForgotPassword} name="forgotpassword" />
			<Route handler={Project} name="project" path="/project/:projectID" />
			<Route handler={NewProject} name="new-project" />
			<Route handler={Profile} name="profile" path="/profile/:userID" />
			<Route handler={Admin} name="admin" />
		</Route>
	</Route>
);

ReactRouter.run(routes, function(Handler) {
	React.render(<Handler/>, document.getElementById("root"));
});
