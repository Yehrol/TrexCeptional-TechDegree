/***********************************************************
* Author : De Biasi Loris
* Description : The genome class
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

/** Class used to instanciate a genome. Used to store the fitness of a neural network */
class Genome {
	/**
	 * Create a genome.
 	 * @constructor
	 * @param {number} pTopology - The topology of the neural network
	 * @param {activationFunction} pActivationFunction - The activation function
	 */
	constructor(pTopology, pActivationFunction) {
		this.fitness = 0;
		this.neuralNet = new NeuralNetwork(pTopology, pActivationFunction);
	}

	/**
     * Set the fitness of this genome
	 * @param {number} pFitness - The fitness
     */
	setFitness(pFitness) {
		this.fitness = pFitness;
	}

	/**
     * Get the fitness of this genome
     * @return {number} the weights of the genome.
     */
	getWeights() {
		return this.neuralNet.getWeights();
	}

	/**
     * Set the weight of this genome
	 * @param {number} pWeights - The weights of the genome
     */
	setWeights(pWeights) {
		this.neuralNet.setWeights(pWeights);
	}

	/**
     * Feed forward the input values
	 * @param {number} inputValues - The input values
     */
	feedForward(inputValues) {
		this.neuralNet.feedForward(inputValues);
	}

	/**
     * Get the output of the neural network
     * @return {number} the output value.
     */
	getOutput() {
		return this.neuralNet.getOutput();
	}

	/**
     * Draw the neural network
	 * @param {canvas} canvas - The canvas
	 * @param {context} context - The context of the canvas
     */
	drawNeuralNet(canvas,context) {
		this.neuralNet.drawNeuralNet(canvas,context);
	}
}