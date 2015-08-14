CLIENT_ID = "320643691401-5m3ipff7ghamacndnvipda0uqi3eranu.apps.googleusercontent.com";
CLIENT_SCOPES = [
	"https://www.googleapis.com/auth/gmail.readonly",
	"https://www.googleapis.com/auth/gmail.send",
	"https://www.googleapis.com/auth/drive",
];

// Google
function onGoogleClientReady() {
	dispatcher.dispatch({type: "googleClientIsReady"});
}

// Google+
function onGooglePlatformReady() {
	gapi.load("auth2", function() {
		auth2 = gapi.auth2.init({
			client_id: CLIENT_ID,
		});
	});
}

function initGoogleAPIs() {
	var authUser = sessionStorage.getItem("authUser");
	console.log(authUser);

	gapi.auth.authorize({
		client_id: CLIENT_ID,
		scope: CLIENT_SCOPES,
		authuser: authUser,
		immediate: true,
	}, handleGoogleClientAuth);
}

function handleGoogleClientAuth(authResult) {
	gapi.client.request({
		path: "/oauth2/v1/userinfo",
		callback: function(resp) {
			if (resp.email && resp.verified_email) {
				sessionStorage.setItem("authUser", resp.email);
			}
		},
	});

	if (authResult && !authResult.error) {
		loadPlusAPI();
		loadGMailAPI();
		loadDriveAPI();
	} else {
		console.log("Failed to load GMail API");
	}
}

//
// Plus
//

function loadPlusAPI() {
	gapi.client.load("plus", "v1").then(function() {
		dispatcher.dispatch({type: "googlePlusReady"});
		googlePlusReady = true;
	});
}

function getUserInfo(userID, callback) {
}

function getPeople(userID, callback) {
	var request = gapi.client.plus.people.get({
		userId: userID,
	});

	request.execute(callback);
}

//
// GMail
//

function loadGMailAPI() {
	gapi.client.load("gmail", "v1").then(function() {
		dispatcher.dispatch({type: "googleMailReady"});
		googleMailReady = true;
	});
}

// Send Email
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

	request.execute(callback);
}

// List Threads
function listThreads(params, callback, once) {
	var getPageOfThreads = function(request, result) {
		request.execute(function (resp) {
			result = result.concat(resp.threads);
			var nextPageToken = resp.nextPageToken;
			if (nextPageToken && !once) {
				request = gapi.client.gmail.users.threads.list(m(params, {
					userId: "me",
					pageToken: nextPageToken,
				}));
				getPageOfThreads(request, result);
			} else if (typeof(callback) == "function") {
				callback(result);
			}
		});
	};

	var request = gapi.client.gmail.users.threads.list(m(params, {
		userId: "me",
	}));

	getPageOfThreads(request, []);
}

// List Messages
function listMessages(params, callback, once) {
	var getPageOfMessages = function(request, result) {
		request.execute(function(resp) {
			result = result.concat(resp.messages);
			var nextPageToken = resp.nextPageToken;
			if (nextPageToken && !once) {
				request = gapi.client.gmail.users.messages.list(m({
					userId: "me",
					pageToken: nextPageToken,
				}, params));
				getPageOfMessages(request, result);
			} else if (typeof(callback) == "function") {
				callback(result);
			}
		});
	};

	var initialRequest = gapi.client.gmail.users.messages.list(m(params, {
		userId: "me",
	}));

	getPageOfMessages(initialRequest, []);
}

// Get Full Messages of Threads
function getFullMessagesOfThreads(threads, callback) {
	var batch = gapi.client.newBatch();
	var getMessage = function(thread) {
		return gapi.client.gmail.users.messages.get({
			userId: "me",
			id: thread.id,
		});
	}

	for (var i = 0; i < threads.length; i++) {
		batch.add(getMessage(threads[i]));
	}

	batch.execute(callback);
}

//
// Drive
//

function loadDriveAPI() {
	gapi.client.load("drive", "v2").then(function() {
		dispatcher.dispatch({type: "googleDriveReady"});
		googleDriveReady = true;
	});
}

// List Files
function listFiles(params, callback, once) {
	var retrievePageOfFiles = function(request, result) {
		request.execute(function(resp) {
			if (!resp.items) {
				return;
			}

			result = result.concat(resp.items);
			var nextPageToken = resp.nextPageToken;
			if (nextPageToken && !once) {
				request = gapi.client.drive.files.list(m(params, {
					'pageToken': nextPageToken,
				}));
				retrievePageOfFiles(request, result);
			} else if (typeof(callback) == "function") {
				callback(result);
			}
		});
	}
	var initialRequest = gapi.client.drive.files.list(params);
	retrievePageOfFiles(initialRequest, []);
}

// Get File
function getFile(id, callback) {
	var request = gapi.client.drive.files.get({
		fileId: id,
	});

	request.execute(callback);
}

// Get Files
function getFiles(ids, callback) {
	var batch = gapi.client.newBatch();
	var getFile = function(id) {
		return gapi.client.drive.files.get({
			fileId: id,
		});
	}

	for (i in ids) {
		batch.add(getFile(ids[i]));
	}

	batch.execute(callback);
}

// Insert File
function insertFile(fileData, callback, extra) {
	const boundary = '-------314159265358979323846';
	const delimiter = "\r\n--" + boundary + "\r\n";
	const close_delim = "\r\n--" + boundary + "--";

	var reader = new FileReader();
	reader.readAsBinaryString(fileData);
	reader.onload = function(e) {
		var contentType = fileData.type || 'application/octet-stream';
		var metadata = m({
			title: fileData.name,
			mimeType: contentType,
		}, extra);
		console.log(metadata);

		var base64Data = btoa(reader.result);
		var multipartRequestBody =
			delimiter +
			'Content-Type: application/json\r\n\r\n' +
			JSON.stringify(metadata) +
			delimiter +
			'Content-Type: ' + contentType + '\r\n' +
			'Content-Transfer-Encoding: base64\r\n' +
			'\r\n' +
			base64Data +
			close_delim;

		var request = gapi.client.request({
				'path': '/upload/drive/v2/files',
				'method': 'POST',
				'params': {'uploadType': 'multipart'},
				'headers': {
				'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
				},
				'body': multipartRequestBody});
		if (!callback) {
			callback = function(file) {
				console.log(file)
			};
		}
		request.execute(callback);
	}
}

// Delete File
function deleteFile(id, callback) {
	var request = gapi.client.drive.files.delete({
		fileId: id,
	});

	request.execute(callback);
}
