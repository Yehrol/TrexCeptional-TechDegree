/***********************************************************
* Author : De Biasi Loris
* Description : The neural network class
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

/** Class used to instanciate a neural network */
class NeuralNetwork {
	/**
	 * Create a neural network.
 	 * @constructor
	 * @param {number} pTopology - The topology of the neural network
	 * @param {activationFunction} pActivationFunction - The activation function
	 */
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

	/**
	 * Feed forward the values
	 * @param {number} inputValues - The input values
	 */
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

	/**
	 * Get the weights of this neural network
	 * @return {number} The weights of the neural network.
	 */
	getWeights() {
		var weights = [];
		for (var i = 0; i < this.layers.length; i++) {
			weights.push(this.layers[i].getWeights());
		}
		return ravel(weights);
	}

	/**
	 * Set the weights of this neural network
	 */
	setWeights(pWeights) {
		var pos = 0;
		for (var i = 0; i < this.numberOfLayers; i++) {
			var nextLayerLength = 1;
			var nbBias = this.layers[i].numberOfBias;

			// If this is the last layer
			if (typeof this.layers[i+1] != "undefined") {
				nbBias = this.layers[i+1].numberOfBias;
				nextLayerLength = this.layers[i+1].neurons.length;
			}
			
			nextLayerLength -= nbBias;

			var nbOfNeuronsInLayer = (this.layers[i].neurons.length) * nextLayerLength;
			this.layers[i].setWeights(pWeights.slice(pos, pos + nbOfNeuronsInLayer), nextLayerLength);
			pos+=nbOfNeuronsInLayer;
		}
	}

	/**
	 * Get the result of the output neuron
	 * @return {number} The output value.
	 */
	getOutput() {
		return this.layers[this.layers.length - 1].neurons[0].outputValue;
	}

	/**
	 * Draw the neural network
	 */
	drawNeuralNet(canvas,context) {
		// The size in pixel for a neuron
		var neuronSize = 0;
		var neuronSpace = 10;
		var spaceFromBorder = 20;
		var pourcent = 15;

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

		context.clearRect(0,0,canvas.width,canvas.height);

		//
		var spaceBetweenNeuronX = 0;
		var spaceBetweenNeuronY = 0;
		for (var y = 0; y < this.layers.length; y++) {
			// Get the size between neuron [Y axis]
			spaceBetweenNeuronY = ((canvas.width - (spaceFromBorder * 2)) / (this.layers.length - 1)) - neuronSize / 2;
			for (var x = 0; x < this.layers[y].neurons.length; x++) {
				// Get the size between neuron [X axis]
				spaceBetweenNeuronX = ((canvas.height - (this.layers[y].neurons.length * neuronSize)) / (this.layers[y].neurons.length + 1));

				var posY = spaceBetweenNeuronY * y + spaceFromBorder + neuronSize / 2;
				var posX = spaceBetweenNeuronX * (x+1) + neuronSize * x + neuronSize / 2;

				// Change the color if this is the bias
				if (x == this.layers[y].neurons.length - 1) {
					context.fillStyle="#BDBDBD";
					context.strokeStyle="#BDBDBD";
				}
				else {
					context.fillStyle="#ee6e73";
					context.strokeStyle="#ee6e73";
				}

				context.lineWidth=1.5;

				// Draw the circle
				context.beginPath();
				context.arc(posY, posX, neuronSize / 2, 0, 2 * Math.PI);
				context.stroke();
				context.closePath();

				// Draw the output values of each neuron
				context.font = "20px Arial";
				//log(this.layers[y].neurons[x]);

				context.fillText(this.layers[y].neurons[x].outputValue.toFixed(3),posY - (context.measureText(this.layers[y].neurons[x].outputValue.toFixed(3)).width / 2), posX + 10);

				// Draw the line
				if (y + 1 < this.layers.length) {
					var nextSpaceBetweenNeuronX = (canvas.height - (this.layers[y+1].neurons.length * neuronSize)) / (this.layers[y+1].neurons.length + 1);
					for (var neuronIndex = 0; neuronIndex < this.layers[y+1].neurons.length - 1; neuronIndex++) {

						// Draw the line
						var linePosY = posY + neuronSize / 2;
						var nextPosY = spaceBetweenNeuronY * (y+1) + spaceFromBorder;
						var nextPosX = nextSpaceBetweenNeuronX * (neuronIndex+1) + neuronSize * neuronIndex + neuronSize / 2;

						var yPourcent = Math.ceil(Math.ceil(linePosY - nextPosY) / 100 * pourcent);
						var xPourcent = Math.ceil(Math.ceil(posX - nextPosX) / 100 * pourcent);

						context.beginPath();

						// Draw the line
						context.moveTo(linePosY, posX);
						context.lineTo(nextPosY, nextPosX);
						context.stroke();

						// Change the font
						context.font = "12px Arial";

						// Rect behind the text
						context.fillStyle="#FFFFFF";
						context.fillRect(linePosY - yPourcent - 2, posX - xPourcent - 11, 38, 13);

						// Draw the weight
						context.fillStyle="#000000";

						// Draw the weight of each neuron
						context.fillText(this.layers[y].neurons[x].outputWeights[neuronIndex].weight.toFixed(3),linePosY - yPourcent, posX - xPourcent);
					}
				}
			}
		}
	}

	// 
	/*backPropagation(targetValues) {
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
		for (var layerNum = this.layers.length; layerNum > 0; layerNum--) {// - this.layers.numberOfBias
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
	}*/
}