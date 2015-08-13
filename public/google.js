CLIENT_ID = "320643691401-5m3ipff7ghamacndnvipda0uqi3eranu.apps.googleusercontent.com";
CLIENT_SCOPES = [
	"https://www.googleapis.com/auth/gmail.readonly",
	"https://www.googleapis.com/auth/gmail.send",
	"https://www.googleapis.com/auth/drive.file",
];

var isGoogleClientReady = false;
var isGMailReady = false;

// Google
function onGoogleClientReady() {
	dispatcher.dispatch({type: "googleClientIsReady"});
	isGoogleClientReady = true;
}

// Google+
function onGooglePlatformReady() {
	gapi.load("auth2", function() {
		auth2 = gapi.auth2.init({
			client_id: CLIENT_ID,
		});
	});
}

//
// GMail
//

// sendEmail
function sendEmail(email, callback) {
	if (typeof(email) != "string" || email == "") {
		console.log("Empty email. Not sending");
		return;
	}

	var base64EncodedMessage = btoa(email);
	var request = gapi.client.gmail.users.messages.send({
		userId: "me",
		resource: {
			raw: base64EncodedMessage,
		},
	});

	if (typeof(callback) == "function") {
		request.execute(callback);
	} else {
		request.execute();
	}
}

// GMail: List Threads
function listThreads(q, callback, extra) {
	var getPageOfThreads = function(request, result) {
		request.execute(function (resp) {
			result = result.concat(resp.threads);
			var nextPageToken = resp.nextPageToken;
			if (nextPageToken) {
				request = gapi.client.gmail.users.threads.list(m({
					userId: "me",
					q: q,
					pageToken: nextPageToken,
				}, extra));
				getPageOfThreads(request, result);
			} else {
				if (typeof(callback) == "function") {
					callback(result);
				}
			}
		});
	};

	var request = gapi.client.gmail.users.threads.list(m({
		userId: "me",
		q: q,
	}, extra));

	getPageOfThreads(request, []);
}

// GMail: List Messages
function listMessages(query, callback, extra) {
	var getPageOfMessages = function(request, result) {
		request.execute(function(resp) {
			result = result.concat(resp.messages);
			var nextPageToken = resp.nextPageToken;
			if (nextPageToken) {
				request = gapi.client.gmail.users.messages.list(m({
					userId: "me",
					pageToken: nextPageToken,
					q: query,
				}, extra));
				getPageOfMessages(request, result);
			} else {
				if (typeof(callback) == "function") {
					callback(result);
				}
			}
		});
	};

	var initialRequest = gapi.client.gmail.users.messages.list(m({
		userId: "me",
		q: query,
	}, extra));

	getPageOfMessages(initialRequest, []);
}
