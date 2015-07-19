// jQuery.extend
function m() {
	var res = {};
	for (var i = 0; i < arguments.length; i++) {
		if (arguments[i]) {
			$.extend(res, arguments[i]);
		}
	}
	return res;
};

function buildElements(items, elemFunc, start, end) {
        var elems = [];

        if (!items) {
            return elems;
        }

		if (!start) {
			start = 0;
		}

		if (!end) {
			end = items.length;
		} else {
			end = end > items.length ? items.length : end;
		}

        for (var i = start; i < end; i++) {
            elems.push(elemFunc(i, items[i]))
        }

        return elems;
}
