/***********************************************************
* Author : De Biasi Loris
* Description : The activation function class
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

/** Abstract class for activation function */
class activationFunction {
	constructor() {
		if (new.target === activationFunction) {
			throw new TypeError("Cannot construct activationFunction instances directly");
		}
	}

	normal(x) { throw new Error("Must override method"); }
	derivative(x) { throw new Error("Must override method"); }
}

/**
 * Sigmoid activation function class
 * @extends activationFunction
 */
class sigmoid extends activationFunction {
	/**
     * Create a sigmoid
 	 * @constructor
     */
	constructor() {
		// Parent constructor
		super();
	}

	/**
     * Normal function
     * @return {number} The result of the function
     */
	normal(x) {
		return 1/(1+Math.pow(Math.E, -x));
	}

	/**
     * Derivative function
     * @return {number} The result of the derivative function
     */
	derivative(x) {
		return Math.exp(-x / ((1+Math.exp(-x))**2));
	}
}

/**
 * Tanh activation function class
 * @extends activationFunction
 */
class tanh extends activationFunction{
	/**
     * Create a tanh
 	 * @constructor
     */
	constructor() {
		// Parent constructor
		super();
	}
	
	/**
     * Normal function
     * @return {number} The result of the function
     */
	normal(x) {
		return Math.tanh(x);
	}

	/**
     * Derivative function
     * @return {number} The result of the derivative function
     */
	derivative(x) {
		return 1 - (x * x);
	}
}