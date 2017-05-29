/***********************************************************
* Author : De Biasi Loris
* Description : The layer class
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

/** Class used to create a layer for a neural network */
class Layer {
	/**
	 * Create a layer.
 	 * @constructor
	 * @param {number} pNbOfNeurons - The number of neurons
	 * @param {number} pNumberOfOutputs - The number of outputs
	 * @param {activationFunction} pActivationFunction - The activation function
	 */
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

	/**
	 * Get the weights of this layer
	 * @return {number} The weights of the layer.
	 */
	getWeights() {
		var weights = [];
		for (var i = 0; i < this.neurons.length; i++) {//- this.numberOfBias
			weights.push(this.neurons[i].getWeights());
		}
		return ravel(weights);
	}

	/**
	 * Set the weights of this layer
	 */
	setWeights(pWeights, pNextLayerSize) {
		var pos = 0;
		for (var i = 0; i < this.neurons.length; i++) {
			this.neurons[i].setWeights(pWeights.slice(pos, pos + pNextLayerSize));
			pos+=pNextLayerSize;
		}
	}
}