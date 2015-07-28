var App = React.createClass({displayName: "App",
	mixins: [ Navigation ],
	componentDidMount: function() {
		dispatcher.register(function(payload) {
			var data = payload.data;

			switch (payload.type) {
			case "loginDone":
				this.transitionTo("dashboard");
				break;
			case "loginFail":
				Materialize.toast(payload.data.responseText, 1000, "red");
				break;
			case "registerDone":
				this.transitionTo("login");
				Materialize.toast(payload.data.message, 3000);
				break;
			case "registerFail":
				Materialize.toast(payload.data.responseText, 1000, "red");
				break;
			case "logoutDone":
				this.transitionTo("intro");
				break;
			case "logoutFail":
				Materialize.toast(resp.responseText, 1000, "red");
				break;
			}
		}.bind(this));
	},
	render: function() {
		return (
			React.createElement(RouteHandler, null)
		)
	},
});
