/***********************************************************
* Author : De Biasi Loris
* Description : 
* Version : 0.1
* Date : 16.06.2017
***********************************************************/

class crossover {
	//
	constructor() {
		if (new.target === crossover) {
			throw new TypeError("Cannot construct crossover instances directly");
		}
	}

	process(pGeneration,pSelectedGenomes) { throw new Error("Must override method"); }
}

class singlePointCrossover extends crossover {
	constructor() {
		// Parent constructor
		super();
	}

	process(pGeneration,pSelectedGenomes) {
		var children = [];
		// Create a copy of the genomes
		var genClone = new Generation(pGeneration.topology, pGeneration.numberOfGenomes, pGeneration.activationFunction, pGeneration.rate);
		var weights = [];

		// Store all the weights in an array
		for (var g = 0; g < pSelectedGenomes.length; g++) {
			weights.push(pSelectedGenomes[g].getWeights());
		}

		// For each genome minus the number of selected genomes divided by 2
		for (var genIndex = 0; genIndex < pGeneration.genomes.length - (pSelectedGenomes.length / 2); genIndex++) {
			//Pair of genome
			for (var pairIndex = 0; pairIndex < pSelectedGenomes.length; pairIndex+=2) {
				//Get the pair of genome
				var breedA;
				var breedB;
				var newWeight = [];
				//Number of genome to create per pair
				for (var i = 0; i < pGeneration.genomes.length / (pSelectedGenomes.length / 2); i++) {
					// Check which breed will be first
					var aFirst = Math.random() >= 0.5; //Random bool
					if (aFirst) {
						breedA = pSelectedGenomes[pairIndex].getWeights();
						breedB = pSelectedGenomes[pairIndex+1].getWeights();
					}
					else{
						breedA = pSelectedGenomes[pairIndex+1].getWeights();
						breedB = pSelectedGenomes[pairIndex].getWeights();
					}

					// Get a random crossover point
					var crossoverPoint = Math.floor(Math.random() * (weights[0].length + 1));

					// Create a new weight
					newWeight.push(breedA.slice(0, crossoverPoint));
					newWeight.push(breedB.slice(crossoverPoint, crossoverPoint + weights[0].length));
					newWeight = ravel(newWeight);
				}
				// Add the new weight
				children.push(newWeight);
			}

			// Assign the new weights
			genClone.genomes[genIndex].setWeights(children[genIndex]);
		}

		// Generate a random genomes
		for (var genIndex = pGeneration.genomes.length - (pSelectedGenomes.length / 2); genIndex < pGeneration.genomes.length; genIndex++) {
			genClone.genomes[genIndex] = new Genome(pGeneration.topology, pGeneration.activationFunction);
		}

		// Return the new generation
		return genClone.genomes;
	}
}

class twoPointCrossover extends crossover{
	constructor() {
		// Parent constructor
		super();
	}

	process(pGeneration,pSelectedGenomes) {
		
	}
}

class uniformCrossover extends crossover{
	constructor() {
		// Parent constructor
		super();
	}
	
	process(pGeneration,pSelectedGenomes) {
		
	}
}