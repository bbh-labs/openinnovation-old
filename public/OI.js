function notifyApp(type) {
	return function(resp) {
		dispatcher.dispatch({
			type: type,
			data: resp,
		});
	}
}

var OI = {
	api: function(name, data, done, fail) {
		if (!done) done = notifyApp(name + "Done");
		if (!fail) fail = notifyApp(name + "Fail");
		$.ajax(data).done(done).fail(done);
	},
	login: function(data) {
		this.api("login", {
			url: "/login",
			method: "POST",
			data: data,
			dataType: "json",
		});
	},
	logout: function() {
		this.api("logout", {
			url: "/api/logout",
			method: "POST",
			dataType: "json",
		});
	},
	register: function(data) {
		this.api("register", {
			url: "/register",
			method: "POST",
			data: data,
			dataType: "json",
		});
	},
	newProject: function(data) {
		this.api("newProject", {
			url: "/api/project",
			method: "POST",
			data: data,
			dataType: "json",
			processData: false,
			contentType: false,
		});
	},
	featuredProjects: function(data) {
		this.api("featuredProjects", {
			url: "/api/project",
			method: "GET",
			dataType: "json",
			data: m(data, {searchType: "featured"}),
		});
	},
	latestProjects: function(data) {
		this.api("featuredProjects", {
			url: "/api/project",
			method: "GET",
			dataType: "json",
			data: m(data, {searchType: "latest"}),
		});
	},
};
