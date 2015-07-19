var App = React.createClass({
	mixins: [ Navigation ],
	componentDidMount: function() {
		dispatcher.register(function(payload) {
			var data = payload.data;

			switch (payload.type) {
			case "login":
				$.ajax({
					url: "/api/login",
					method: "POST",
					data: {
						email: data.email,
						password: data.password,
					},
					dataType: "json",
				}).done(function(resp) {
					this.transitionTo("dashboard");
				}.bind(this)).fail(function(resp) {
					Materialize.toast(resp.responseText, 1000, "red");
				});
				break;
			case "register":
				$.ajax({
					url: "/api/register",
					method: "POST",
					data: {
						email: data.email,
						password: data.password,
					},
					dataType: "json",
				}).done(function(resp) {
					Materialize.toast(resp.message, 3000);
				}).fail(function(resp) {
					Materialize.toast(resp.responseText, 1000, "red");
				});
				break;
			}
		}.bind(this));
	},
	render: function() {
		return (
			<RouteHandler />
		)
	},
});
