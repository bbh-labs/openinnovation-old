function m() {
	var res = {};
	for (var i = 0; i < arguments.length; i++) {
		if (arguments[i]) {
			$.extend(res, arguments[i]);
		}
	}
	return res;
};
