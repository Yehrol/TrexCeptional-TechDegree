// Simulate a key press
// 38=up, 40=down, 32=space
// "keyup", "keydown"
function simulateKeyPress(keycode, type) {
	var evt = new Event(type);
	evt.keyCode=keycode;
	evt.which=evt.keyCode;
	document.dispatchEvent(evt);
}

// Transform a multidimensionnal array into an 1 dimension array
function ravel(array) {
	var result = new Array();
	if (typeof array[0] == "undefined" || typeof array[0] == "number") {//TO CHANGE
		result = array;
	}
	else {
		for (var i = 0; i < array.length; i++) {
			for (var j = 0; j < array[i].length; j++) {
				result.push(array[i][j]);
			}
		}
	}

	return result;
}