const EMAIL_SAMPLE =
'To: Jacky Boen <jacky.boen@bartleboglehegarty.com>\n'+
'Subject: Saying Hello\n'+
'\n'+
'This is a message just to say hello. So, "Hello".\n';

function buildEmail(to, subject, content) {
	if (!Array.isArray(to)) {
		console.log("Recipients must be an array of name and email addresses. e.g. 'John Doe <john.doe@google.com>'");
		return "";
	}

	if (typeof(subject) != "string") {
		console.log("Subject must be a string");
		return "";
	}

	if (typeof(content) != "string") {
		console.log("Content must be a string");
		return "";
	}

	var message =

	// To
	"To: " +
	to.join(",") + "\n" +

	// Subject
	"Subject: " + subject + "\n\n" +
	
	// Content
	content + "\n";

	console.log(message);
	return message;
}
