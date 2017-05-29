/***********************************************************
* Author : De Biasi Loris
* Description : The selection method class
* Version : 0.1
* Date : 16.06.2017
***********************************************************/

/** Abstract class for selection method */
class selection {
	constructor() {
		if (new.target === selection) {
			throw new TypeError("Cannot construct selection instances directly");
		}
	}

	process(pGeneration) { throw new Error("Must override method"); }
}

/**
 * NOT USED AND MUST BE CHANGED
 * @extends selection
 */
class selectionOfBest extends selection {
	constructor() {
		// Parent constructor
		super();
	}

	/**
	 * Process the selection method
     * @param {number} pGeneration - The generation.
     * @return {number} The selected parents.
	 */
	process(pGeneration) {
		// Store the best genome
		var selected = [];
		var tmpWeight = [];
		var genomeToAppend;
		var max = -1;
		var genClone;
		var indexToRemove;

		// Create a clone of the genomes
		genClone = new Generation(pGeneration.topology, pGeneration.numberOfGenomes, pGeneration.activationFunction, pGeneration.rate);

		// Get all the weights of the generation
		for (var g = 0; g < pGeneration.genomes.length; g++) {
			tmpWeight.push(pGeneration.genomes[g].getWeights());
		}

		// Set all the weights to the tmp generation (copy)
		for (var g = 0; g < pGeneration.genomes.length; g++) {
			genClone.genomes[g].setWeights(tmpWeight[g]);
		}
		//

		// Set the fitness
		for (var i = 0; i < pGeneration.genomes.length; i++) {
			genClone.genomes[i].setFitness(pGeneration.genomes[i].fitness);
		}

		// Select the best genomes [2 * (sqrt(nbOfGenomes) / 2)]
		for (var i = 0; i < 2*Math.floor(Math.sqrt(pGeneration.genomes.length)/2); i++) { // Number of wanted genomes for breeding
			max = -1;
			// Check the best fitness
			for (var j = 0; j < genClone.genomes.length; j++) {
				// If a genome as a higher score
				if (max < genClone.genomes[j].fitness) {
					max = genClone.genomes[j].fitness;

					// Store the best genome
					genomeToAppend = genClone.genomes[j];
					indexToRemove = j;
				}
			}
			selected.push(genomeToAppend);

			// Remove the genome from the copied array
			genClone.genomes.splice(indexToRemove, 1);
		}

		return selected;
	}
}

/**
 * Roulette wheel selection method
 * @extends selection
 */
class rouletteWheelSelection extends selection{
	constructor() {
		// Parent constructor
		super();
	}

	/**
	 * Process the selection method
     * @param {number} pGeneration - The generation.
     * @return {number} The selected parents.
	 */
	process(pGeneration) {
		var selected = [];
		var numberOfWantedParents = 2;//2*Math.floor(Math.sqrt(pGeneration.genomes.length)/2)

		for (var i = 0; i < numberOfWantedParents; i++) { // Number of wanted genomes for breeding
			var sum = 0;
			var weightSum = 0;

			// Get the total fitness
			for (var genomeIndex = 0; genomeIndex < pGeneration.genomes.length; genomeIndex++) {
				weightSum += pGeneration.genomes[genomeIndex].fitness + 0.1; // +0.1 because some can have 0 fitness
			}

			//
			var treshold = Math.random() * weightSum;

			for (var genomeIndex = 0; genomeIndex < pGeneration.genomes.length; genomeIndex++) {
				sum += pGeneration.genomes[genomeIndex].fitness + 0.1;
				if (sum > treshold) {
					selected.push(pGeneration.genomes[genomeIndex]);
					pGeneration.genomes.splice(genomeIndex, 1)
					break;
				}
			}
		}

		return selected;
	}
}