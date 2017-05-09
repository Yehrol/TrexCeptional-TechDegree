/***********************************************************
* Author : De Biasi Loris
* Description : 
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

class Connection {
	// Constructor
	constructor() {
		// Create the initial weight
		this.weight = this.randomWeight(-1,1);
		
		this.deltaWeight;
	}

	getWeight() {
		return this.weight;
	}

	setWeight(pWeight) {
		this.weight = pWeight;
	}

	// Return a random float between min an max (both include)
	// Source : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	randomWeight(min, max){
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.random() * (max - min) + min;
	}
}