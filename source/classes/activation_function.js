/***********************************************************
* Author : De Biasi Loris
* Description : 
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

class activationFunction {
	//
	constructor() {
		if (new.target === activationFunction) {
			throw new TypeError("Cannot construct activationFunction instances directly");
		}
	}

	normal(x) {}
	derivative(x) {}
}

class sigmoid extends activationFunction {
	normal(x) {
		return 1/(1+Math.pow(Math.E, -x));
	}

	derivative(x) {
		return Math.exp(-x / ((1+Math.exp(-x))**2));
	}
}

class tanh extends activationFunction{
	normal(x) {
		return Math.tanh(x);
	}

	derivative(x) {
		return 1 - (x * x);
	}
}