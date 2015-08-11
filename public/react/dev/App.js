var App = React.createClass({
	mixins: [ Navigation ],
	getInitialState: function() {
		return {user: null};
	},
	componentDidMount: function() {
		OI.isLoggedIn();

		this.dispatchID = dispatcher.register(function(payload) {
			var data = payload.data;

			switch (payload.type) {
			case "isLoggedInDone":
			case "loginDone":
				this.setState({user: payload.data.data});
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
				this.setState({user: null});
				break;
			case "logoutFail":
				Materialize.toast(resp.responseText, 1000, "red");
				break;
			case "updateUserDone":
				OI.isLoggedIn();
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		return <RouteHandler user={this.state.user} />
	},
});
