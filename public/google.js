CLIENT_ID = "320643691401-5m3ipff7ghamacndnvipda0uqi3eranu.apps.googleusercontent.com";
CLIENT_SCOPES = [
	"https://www.googleapis.com/auth/gmail.readonly",
	"https://www.googleapis.com/auth/gmail.send",
	"https://www.googleapis.com/auth/drive",
];

var google = {
	onClientReady: function() {
		dispatcher.dispatch({type: "googleClientReady"});
	},
	onPlatformReady: function() {
		gapi.load("auth2", function() {
			auth2 = gapi.auth2.init({
				client_id: CLIENT_ID,
			});
		});
	},
	initAPIs: function() {
		var authUser = sessionStorage.getItem("authUser");

		gapi.auth.authorize({
			client_id: CLIENT_ID,
			scope: CLIENT_SCOPES,
			authuser: authUser,
			immediate: true,
		}, google.handleClientAuth);
	},
	handleClientAuth: function(authResult) {
		gapi.client.request({
			path: "/oauth2/v1/userinfo",
			callback: function(resp) {
				if (resp.email && resp.verified_email) {
					sessionStorage.setItem("authUser", resp.email);
				}
			},
		});

		if (authResult && !authResult.error) {
			google.plus.load();
			google.gmail.load();
			google.drive.load();
			google.drive.share.load();
		} else {
			console.log("Failed to load APIs");
		}
	},
	plus: {
		ready: false,
		load: function() {
			gapi.client.load("plus", "v1").then(function() {
				google.plus.ready = true;
				dispatcher.dispatch({type: "googlePlusReady"});
			}.bind(this));
		},
		getPeople: function(userID, callback) {
			var request = gapi.client.plus.people.get({
				userId: userID,
			});

			request.execute(callback);
		},
	},
	gmail: {
		ready: false,
		load: function() {
			gapi.client.load("gmail", "v1").then(function() {
				google.gmail.ready = true;
				dispatcher.dispatch({type: "googleMailReady"});
			}.bind(this));
		},
		sendEmail: function(email, callback) {
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
		},
		listThreads: function(params, callback, once) {
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
		},
		listMessages: function(params, callback, once) {
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
		},
		getFullMessagesOfThreads: function(threads, callback) {
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
		},
	},
	drive: {
		ready: false,
		load: function() {
			gapi.client.load("drive", "v2").then(function() {
				google.drive.ready = true;
				dispatcher.dispatch({type: "googleDriveReady"});
			}.bind(this));
		},
		listFiles: function(params, callback, once) {
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
		},
		getFile: function(id, callback) {
			var request = gapi.client.drive.files.get({
				fileId: id,
			});

			request.execute(callback);
		},
		getFiles: function(ids, callback) {
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
		},
		insertFile: function(fileData, callback, extra) {
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
				//console.log(metadata);

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
						'body': multipartRequestBody,
				});
				if (!callback) {
					callback = function(file) {
						console.log(file)
					};
				}
				request.execute(callback);
			}
		},
		updateFile: function(fileID, fileData, callback, extra) {
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
				//console.log(metadata);

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
						'path': '/upload/drive/v2/files/' + fileID,
						'method': 'PUT',
						'params': {'uploadType': 'multipart'},
						'headers': {
							'Content-Type': 'multipart/mixed; boundary="' + boundary + '"',
						},
						'body': multipartRequestBody,
				});
				if (!callback) {
					callback = function(file) {
						console.log(file)
					};
				}
				request.execute(callback);
			}
		},
		deleteFile: function(fileID, callback) {
			var request = gapi.client.drive.files.delete({
				fileId: fileID,
			});

			request.execute(callback);
		},
		listRevisions: function(fileID, callback) {
			var request = gapi.client.drive.revisions.list({
				fileId: fileID,
			});

			request.execute(callback);
		},
		downloadFile: function(file, callback) {
			if (file.downloadUrl) {
				var accessToken = gapi.auth.getToken().access_token;
				$.ajax({
					url: file.downloadUrl,
					headers: {
						Authorization: "Bearer " + accessToken
					},
				}).done(function(resp) {
					if (callback) {
						callback(resp);
					}
				}).fail(function(resp) {
					console.log(resp);
				});
			} else {
				callback(null);
			}
		},
		share: {
			ready: false,
			instance: null,
			load: function() {
				gapi.load("drive-share", function(e) {
					google.drive.share.instance = new gapi.drive.share.ShareClient(CLIENT_ID);
				});
			},
			show: function(fileIDs) {
				var instance = google.drive.share.instance;
				if (instance) {
					instance.setItemIds(fileIDs);
					instance.showSettingsDialog();
				}
			},
		},
	},
};

function onGoogleClientReady() {
	google.onClientReady();
}
