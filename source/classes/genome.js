/***********************************************************
* Author : De Biasi Loris
* Description : 
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

class Genome {
	constructor(pTopology, pActivationFunction) {
		this.fitness = 0;
		this.neuralNet = new NeuralNetwork(pTopology, pActivationFunction);
	}

	setFitness(pFitness) {
		this.fitness = pFitness;
	}

	getWeights() {
		return this.neuralNet.getWeights();
	}

	setWeights(pWeights) {
		this.neuralNet.setWeights(pWeights);
	}

	feedForward(inputValues) {
		this.neuralNet.feedForward(inputValues);
	}

	getOutput() {
		return this.neuralNet.getOutput();
	}

	drawNeuralNet(canvas,context) {
		this.neuralNet.drawNeuralNet(canvas,context);
	}
}