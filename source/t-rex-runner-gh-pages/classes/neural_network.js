/***********************************************************
* Author : De Biasi Loris
* Description : 
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

class NeuralNetwork {
	// Constructor
	constructor(pTopology, pActivationFunction) {
		// Store the number of layer
		this.numberOfLayers = pTopology.length;

		// Store the layers
		this.layers = [];

		// Create the layers structure
		for (var layerNum = 0; layerNum < this.numberOfLayers; layerNum++) {
			var numberOfOutputs = 0
			// If the current layer num is not the last one
			if (layerNum != pTopology.length - 1) {
				// Store the size of the next layer
				numberOfOutputs = pTopology[layerNum + 1];
			}

			// Create a new layer
			this.layers.push(new Layer(pTopology[layerNum], numberOfOutputs, pActivationFunction));
		}

		//
		this.layers[this.layers.length - 1].neurons[this.layers[this.layers.length - 1].neurons.length - 1].outputValue = 1;
	}

	// 
	feedForward(inputValues) {
		// Assign the input values into the input neurons
		for (var i = 0; i < inputValues.length; i++) {
			this.layers[0].neurons[i].outputValue = inputValues[i];
		}

		// Forward propagate (start from 1 because input layer is set before)
		for (var layerNum = 1; layerNum < this.layers.length; layerNum++) {
			// Store the previous layer
			var previousLayer = this.layers[layerNum - 1];

			// feed forward all the values
			for (var neuronNum = 0; neuronNum < this.layers[layerNum].neurons.length - this.layers[layerNum].numberOfBias; neuronNum++) {
				this.layers[layerNum].neurons[neuronNum].feedForward(previousLayer);
			}
		}
	}

	getWeights() {
		var weights = [];
		for (var i = 0; i < this.layers.length; i++) {
			weights.push(this.layers[i].getWeights());
		}
		return ravel(weights);
	}

	setWeights(pWeights) {
		var pos = 0;
		for (var i = 0; i < this.numberOfLayers; i++) {
			var nextLayerLength = 1;
			var nbBias = this.layers[i].numberOfBias;

			if (typeof this.layers[i+1] != "undefined") {
				nbBias = this.layers[i+1].numberOfBias;
				nextLayerLength = this.layers[i+1].neurons.length - nbBias;
			}
			
			var nbOfNeuronsInLayer = (this.layers[i].neurons.length - nbBias) * nextLayerLength;
			//BUG ICI dans le slice
			log(nbOfNeuronsInLayer);
			this.layers[i].setWeights(pWeights.slice(pos, nbOfNeuronsInLayer), nextLayerLength);
			pos+=nbOfNeuronsInLayer;
		}
	}

	// 
	backPropagation(targetValues) {
		// Calculate overall net error (RMS)
		var outputLayer = this.layers;
		var error = 0;

		//
		for (var neuronNum = 0; neuronNum < outputLayer.length - outputLayer.numberOfBias; neuronNum++) {
			var delta = targetValues[neuronNum] - outputLayer[neuronNum].outputValue;
			error += delta * delta;
		}

		// Get the average error
		error /= outputLayer.length - 1;

		// RMS
		error = Math.sqrt(error);

		// Calculate output layer gradients
		for (var neuronNum = 0; neuronNum < outputLayer.length - outputLayer.numberOfBias; neuronNum++) {
			outputLayer[neuronNum].calculateOutputGradients(targetValues[neuronNum]);
		}

		// calculate gradients on hidden layers
		for (var layerNum = this.layers.length - this.layers.numberOfBias; layerNum > 0; layerNum--) {
			var currentLayer = this.layers[layerNum];
			var previousLayer = this.layers[layerNum - 1];

			for (var neuronNum = 0; neuronNum < this.layers.length - 1; ni++) {
				currentLayer[neuronNum].updateInputWeights(previousLayer);
			}
		}

		// For all layers output to first hidden layer, update connection weights
	}

	// 
	getResults(resultValues) {
		resultValues = [];

		for (var neuronNum = 0; neuronNum < this.layers.length - this.layers.numberOfBias; neuronNum++) {
			resultValues.push(this.layers[neuronNum].outputValue);
		}
	}

	// Get the result of the output neuron
	getOutput() {
		return this.layers[this.layers.length - 1].neurons[0].outputValue;
	}
}