/***********************************************************
* Author : De Biasi Loris
* Description : The generation class.
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

/** Class used to create a generation. */
class Generation {
	/**
	 * Create a generation.
 	 * @constructor
	 * @param {number} pTopology - The topology of the neural network
	 * @param {number} pNbOfGenome - The number of genomes
	 * @param {activationFunction} pActivationFunction - The activation function
	 * @param {selectionMethod} pSelectionMethod - The selection method
	 * @param {crossoverMethod} pCrossoverMethod - The crossover method
	 * @param {mutationMethod} pMutationMethod - The mutation method
	 */
	constructor(pTopology, pNbOfGenome, pActivationFunction, pSelectionMethod, pCrossoverMethod, pMutationMethod) {
		this.genomes = [];
		if (pNbOfGenome < 4) {
			this.numberOfGenomes = 4;
		}
		else {
			this.numberOfGenomes = pNbOfGenome;
		}
		this.generation = 0;
		this.currentGenome = 0;

		// Store the power for the fitness
		this.power = 1;

		// Set the different method used to create a new generation
		this.selection = pSelectionMethod;
		this.crossover = pCrossoverMethod;
		this.mutation = pMutationMethod;

		// Forced to store them to create a new object from the object himself
		this.topology = pTopology;
		this.activationFunction = pActivationFunction;

		this.bestNeuralNet = new Genome(pTopology, pActivationFunction);

		// Create the new generation
		for (var i = 0; i < this.numberOfGenomes; i++) {
			this.genomes.push(new Genome(pTopology, pActivationFunction));
		}
	}

	/**
     * Run the current generation and return the output value
	 * @param {number} input - The input values
     * @return {number} the output value.
     */
	run(input) {
		// Feed the neural network with the value
    	this.genomes[this.currentGenome].feedForward(input);

		// Check which move the AI should do
		var result = this.genomes[this.currentGenome].getOutput();
		
		return result;
	}

	/**
     * Create the next generation
	 * @param {number} pFitness - The fitness
	 * @param {chart} pFitnessChart - The fitness chart
     */
	nextGen(pFitness, pFitnessChart) {
		// Store the score of the current genome
		this.genomes[this.currentGenome].setFitness(pFitness**this.power);

		// Get the best neural net ever made
		if (this.bestNeuralNet.fitness < pFitness**this.power) {
			this.bestNeuralNet = this.genomes[this.currentGenome];
		}

		// Change the generation if we used all the genomes
		if (this.currentGenome >= this.genomes.length - 1) {
			// Reset the current genome number
			this.currentGenome = 0;

			// Change the generation
			this.generation++;

			// Add the data to the chart
			addDataToChart(pFitnessChart,this.getBestFitness());

			// Create a new generation
			var selected = this.selection.process(this);
			var newGen = this.crossover.process(this,selected);
			var newMutatedGen = this.mutation.process(newGen);
			this.genomes = newMutatedGen;
			//this.mutation.rate = 
		}
		else {
			this.currentGenome++;
		}
	}

	/**
     * Get the fitness average of the generation
     */
	getFitnessAverage() {
		var fitnessAverage = 0;
		for (var i = 0; i < this.genomes.length; i++) {
			fitnessAverage += this.genomes[i].fitness;
		}
		fitnessAverage /= this.genomes.length;

		return Math.pow(fitnessAverage,1/this.power);
	}

	/**
     * Get the best fitness of the generation
     */
	getBestFitness() {
		var bestFitness = 0;
		for (var i = 0; i < this.genomes.length; i++) {
			if (bestFitness < this.genomes[i].fitness) {
				bestFitness = this.genomes[i].fitness;
			}
		}

		return Math.pow(bestFitness,1/this.power);
	}
 
	/**
	 * Draw the neural network
	 * @param {canvas} canvas - The canvas
	 * @param {context} context - The context of the canvas
	 */
	drawNeuralNet(canvas,context) {
		this.genomes[this.currentGenome].drawNeuralNet(canvas,context);
	}
}