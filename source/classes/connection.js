/***********************************************************
* Author : De Biasi Loris
* Description : The connection class
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

/** Class used to store the connection weight of a neuron */
class Connection {
	/**
	 * Create a connection.
 	 * @constructor
	 */
	constructor() {
		// Create the initial weight
		this.weight = this.randomWeight(-1,1);
		
		//this.deltaWeight;
	}

	/**
	 * Get the weight
	 * @return {number} The weights if this connection
	 */
	getWeight() {
		return this.weight;
	}

	/**
	 * Set the weight
	 */
	setWeight(pWeight) {
		this.weight = pWeight;
	}

	/**
	 * Return a random float between min an max (both include)
	 * Source : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
     * @param {number} min - The min value.
     * @param {number} max - The max value.
	 */
	randomWeight(min, max){
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.random() * (max - min) + min;
	}
}