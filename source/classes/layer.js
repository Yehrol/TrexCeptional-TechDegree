/***********************************************************
* Author : De Biasi Loris
* Description : 
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

class Layer {
	// Constructor
	constructor(pNbOfNeurons, pNumberOfOutputs, pActivationFunction) {
		// Store the neurons
		this.neurons = [];

		// Store the number of bias
		this.numberOfBias = 1;

		// Create all the neurons and the bias
		for (var neuronNum = 0; neuronNum < pNbOfNeurons + this.numberOfBias; neuronNum++) {
			this.neurons.push(new Neuron(pNumberOfOutputs, neuronNum, pActivationFunction));
		}
	}

	getWeights() {
		var weights = [];
		for (var i = 0; i < this.neurons.length; i++) {//- this.numberOfBias
			weights.push(this.neurons[i].getWeights());
		}
		return ravel(weights);
	}

	setWeights(pWeights, pNextLayerSize) {
		var pos = 0;
		for (var i = 0; i < this.neurons.length; i++) {
			this.neurons[i].setWeights(pWeights.slice(pos, pos + pNextLayerSize));
			pos+=pNextLayerSize;
		}
	}
}