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
			this.layers[i].setWeights(pWeights.slice(pos, pos + nbOfNeuronsInLayer), nextLayerLength);
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

	drawNeuralNet(canvas,context) {
		// The size in pixel for a neuron
		var neuronSize = 0;
		var neuronSpace = 10;

		// Get the biggest number of neuron per layer
		var maxNeuron = 0;
		for (var i = 0; i < this.layers.length; i++) {
			if (this.layers[i].neurons.length > maxNeuron) {
				maxNeuron = this.layers[i].neurons.length;
			}
		}

		// Get the lowest size (used to create circle)
		if ((canvas.height / maxNeuron) < (canvas.width / this.layers.length)) {
			neuronSize = (canvas.height / maxNeuron);
		}
		else {
			neuronSize = canvas.width / this.layers.length;
		}

		//
		neuronSize -= neuronSpace;

		// Font
		context.font = "30px Arial";

		//
		var spaceBetweenNeuronX = 0;
		var spaceBetweenNeuronY = 0;
		for (var y = 0; y < this.layers.length; y++) {
			// Get the size between neuron [Y axis]
			spaceBetweenNeuronY = canvas.width / (this.layers.length + 1);
			for (var x = 0; x < this.layers[y].neurons.length; x++) {
				// Get the size between neuron [X axis]
				spaceBetweenNeuronX = (canvas.height - (this.layers[y].neurons.length * neuronSize)) / (this.layers[y].neurons.length + 1)

				// Draw the circle
				context.beginPath();
				context.arc(spaceBetweenNeuronY * (y+1), spaceBetweenNeuronX * (x+1) + neuronSize * x + neuronSize / 2, neuronSize / 2, 0, 2 * Math.PI);
				context.stroke();
				context.closePath();

				// Draw the line
				if (y + 1 < this.layers.length) {
					var nextSpaceBetweenNeuronX = (canvas.height - (this.layers[y+1].neurons.length * neuronSize)) / (this.layers[y+1].neurons.length + 1);
					for (var neuronIndex = 0; neuronIndex < this.layers[y+1].neurons.length; neuronIndex++) {
						context.beginPath();
						// Draw the text
						log(this.layers[y]);
						context.fillText(this.layers[y].neurons[neuronIndex].outputWeights[].weight,spaceBetweenNeuronY * (y+1) + neuronSize / 2, spaceBetweenNeuronX * (x+1) + neuronSize * x + neuronSize / 2);
						// Draw the line
						context.moveTo(spaceBetweenNeuronY * (y+1) + neuronSize / 2, spaceBetweenNeuronX * (x+1) + neuronSize * x + neuronSize / 2);
						context.lineTo(spaceBetweenNeuronY * (y+2) - neuronSize / 2, nextSpaceBetweenNeuronX * (neuronIndex+1) + neuronSize * neuronIndex + neuronSize / 2);
						context.stroke();
					}
				}

				//NEED TO ADD THE WEIGHTS

			}
		}
	}
}