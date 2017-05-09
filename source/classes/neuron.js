/***********************************************************
* Author : De Biasi Loris
* Description : 
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

class Neuron {
	// Constructor
	constructor(pNumberOfOutputs, pIndex, pActivationFunction) {
		// Store the number of output
		this.numberOfOutputs = pNumberOfOutputs;

		// Store the output value
		this.outputValue = 1;

		// Store the connections
		this.outputWeights = [];

		// Create the connections
		for (var c = 0; c < this.numberOfOutputs; c++) {
			this.outputWeights.push(new Connection());
		}

		// 
		this.index = pIndex;

		// 
		this.gradient;

		// 
		this.eta = 0.15; // [0..1]
		this.alpha = 0.5; // [0..n]

		// Store the activation function
		this.activationFunction = pActivationFunction;
	}

	getWeights() {
		//log(this.outputWeights);
		var weights = [];
		for (var i = 0; i < this.outputWeights.length; i++) {
			weights.push(this.outputWeights[i].getWeight());
		}
		//log(ravel(weights));
		return ravel(weights); //weights
	}

	setWeights(pWeights) {
		for (var c = 0; c < this.numberOfOutputs; c++) {
			this.outputWeights[c].setWeight(pWeights[c]);
		}
	}

	//
	feedForward(previousLayer) {
		var sum = 0;
		
		// 
		for (var n = 0; n < previousLayer.neurons.length - 1; n++) {
			sum += previousLayer.neurons[n].outputValue * previousLayer.neurons[n].outputWeights[this.index].weight;
		}
		
		this.outputValue = this.activationFunction.normal(sum);
	}

	//
	calculateOutputGradients(targetValue) {
		var delta = targetValue - this.outputValue;
		this.gradient = delta * this.activationFunction.derivative(this.outputValue);
	}

	//
	calculateHiddenGradients(nextLayer) {
		dow = sumDow(nextLayer);
		this.gradient = dow * this.activationFunction.derivative(this.outputValue);
	}

	//
	sumDow(nextLayer) {
		var sum;

		for (var n = 0; n < nextLayer.length - nextLayer.numberOfBias; n++) {
			sum += this.outputWeights[n].weight * nextLayer[n].gradient;
		}

		return sum;
	}

	//
	updateInputWeights(previousLayer) {
		for (var n = 0; n < previousLayer.length; n++) {
			var neuron = previousLayer[n];
			var oldDeltaWeight = neuron.outputWeights[this.index].deltaWeight;

			// eta = learning rate
			// alpha = momentum rate, multiplier of the old change in weight
			var newDeltaWeight = this.eta * neuron.outputValue * this.gradient + this.alpha * oldDeltaWeight;

			neuron.outputWeights[this.index].deltaWeight = newDeltaWeight;
			neuron.outputWeights[this.index].weight += newDeltaWeight;
		}
	}
}