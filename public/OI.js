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
		$.ajax(data).done(done).fail(fail);
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
			data: m(data, {type: "featured"}),
		});
	},
	latestProjects: function(data) {
		this.api("latestProjects", {
			url: "/api/project",
			method: "GET",
			dataType: "json",
			data: m(data, {type: "latest"}),
		});
	},
	project: function(data) {
		this.api("project", {
			url: "/api/project",
			method: "GET",
			dataType: "json",
			data: data,
		});
	},
	updateProject: function(data) {
		this.api("updateProject", {
			url: "/api/project",
			method: "PUT",
			dataType: "json",
			data: data,
		});
	},
	newTask: function(data) {
		this.api("newTask", {
			url: "/api/task",
			method: "POST",
			dataType: "json",
			data: data,
		});
	},
	deleteTask: function(data) {
		this.api("deleteTask", {
			url: "/api/task?taskID=" + data.taskID + "&projectID=" + data.projectID,
			method: "DELETE",
			dataType: "json"
		});
	},
	getProjectTasks: function(data) {
		this.api("getProjectTasks", {
			url: "/api/task",
			method: "GET",
			dataType: "json",
			data: m(data, {type: "project"}),
		});
	},
};
