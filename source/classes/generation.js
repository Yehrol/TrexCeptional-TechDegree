/***********************************************************
* Author : De Biasi Loris
* Description : 
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

class Generation {
	constructor(pTopology, pNbOfGenome, pActivationFunction, pRate) {
		this.genomes = [];
		this.numberOfGenomes = pNbOfGenome;
		this.generation = 0;
		this.currentGenome = 0;
		this.rate = pRate;

		// Forced to store them to create a new object from the object
		this.topology = pTopology;
		this.activationFunction = pActivationFunction;

		// Create the new generation
		for (var i = 0; i < this.numberOfGenomes; i++) {
			this.genomes.push(new Genome(pTopology, pActivationFunction));
		}
	}

	//
	run(pVelocity, pDistance, pYPosition, pSize) {
		var normalizedVelocity = pVelocity / maxVelocity;
	    var normalizedDistance = pDistance / maxDistance;
	    var normalizedYPosition = pYPosition / maxYPosition;
	    var normalizedSize = pSize / maxSize;

		// Create the input array for the neural network
		var input = [normalizedVelocity,normalizedDistance,normalizedYPosition,normalizedSize];

		// Feed the neural network with the normalized T-Rex value
    	this.genomes[this.currentGenome].neuralNet.feedForward(input);

		// Check which move the AI should do
		if (this.genomes[this.currentGenome].neuralNet.getOutput() > 0.7) { // greater than 0.6 [press up]
			simulateKeyPress(38, "keydown");
		}
		else if (this.genomes[this.currentGenome].neuralNet.getOutput() >= 0.4 && this.genomes[this.currentGenome].neuralNet.getOutput() <= 0.6) { // between 0.4 and 0.6 (both include) [do nothing]
			// do nothing
		} 
		else if (this.genomes[this.currentGenome].neuralNet.getOutput() < 0.3) { // less than 0.4 [press down]
			simulateKeyPress(40, "keydown");
		}
	}

	//
	nextGen(pFitness) {
		// Store the score of the current genome
		this.genomes[this.currentGenome].setFitness(pFitness);

		// Change the generation if we used all the genomes
		if (this.currentGenome >= this.genomes.length - 1) {
			// Reset the current genome number
			this.currentGenome = 0;

			// Change the generation
			this.generation++;

			// Do crossover
			this.selection();
		}
		else {
			this.currentGenome++;
		}
	}

	selection() {
		// Store the best genome
		var selected = [];
		var arrayClone = [];
		var genomeToAppend;
		var max = 0;

		// Create a clone of the genomes
		arrayClone = this.genomes.slice(0);

		// Select the best genomes [2 * (sqrt(nbOfGenomes) / 2)]
		for (var i = 0; i < 2*Math.floor(Math.sqrt(this.genomes.length)/2); i++) { // Number of wanted genomes for breeding
			max = 0;
			// Check the best fitness
			for (var j = 0; j < arrayClone.length; j++) {
				// If a genome as a higher score
				if (max < arrayClone[j].fitness) {
					max = arrayClone[j].fitness;
					// Store the best genome
					genomeToAppend = arrayClone[j];

					// Remove the genome from the copied array
					arrayClone.splice(j, 1);
				}
			}
			selected.push(genomeToAppend);
		}

		this.crossover(selected);
	}

	// 
	crossover(pSelectedGenomes) {
		
		this.singlePointCrossover(pSelectedGenomes);
		//create new gen

	}

	//
	singlePointCrossover(pSelectedGenomes){
		var children = [];
		// Create a copy of the genomes
		var genClone = new Generation(this.topology, this.numberOfGenomes, this.activationFunction);
		var weights = [];

		// Store all the weights in an array
		for (var g = 0; g < pSelectedGenomes.length; g++) {
			weights.push(pSelectedGenomes[g].getWeights());
		}

		// For each genome
		for (var genIndex = 0; genIndex < this.genomes.length; genIndex++) {
			//Pair of genome
			for (var pairIndex = 0; pairIndex < pSelectedGenomes.length; pairIndex+=2) {
				//Get the pair of genome
				var breedA;
				var breedB;
				var newWeight = [];
				//Number of genome to create per pair
				for (var i = 0; i < this.genomes.length / (pSelectedGenomes.length / 2); i++) {
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

		// Assign the new generation
		this.mutationWithRate(genClone.genomes);
		//this.mutation(genClone.genomes);
	}

	//
	mutation(nextGenomes) {
		var weights = [];

		// Store all the weights in an array
		for (var g = 0; g < nextGenomes.length; g++) {
			weights.push(nextGenomes[g].getWeights());
		}

		// Number of values that will change
		var nbValuesToChange;

		// Apply random mutation to each genomes
		for (var genIndex = 0; genIndex < weights.length; genIndex++) {
			// Get the number of values that need to change
			var indexArray = [];
			var alreadyExist;
			nbValuesToChange = Math.floor(Math.random() * (weights[genIndex].length + 1));

			// While we dont have all the index that needs to change
			while (indexArray.length < nbValuesToChange) {
				alreadyExist = false;
				var indexToChange = Math.floor(Math.random() * (weights[genIndex].length + 1));

				// Check if the current index has already been changed
				for (var i = 0; i < indexArray.length; i++) {
					if (indexToChange == indexArray[i]) {
						alreadyExist = true;
					}
				}

				// If the current index hasn't been changed previously
				if (alreadyExist ==  false) {
					indexArray.push(indexToChange)
				}
			}

			// Change the weights randomly
			for (var i = 0; i < indexArray.length; i++) {

				weights[genIndex][indexArray[i]] += Math.random() - 0.5;
			}

			// Apply the changes
			nextGenomes[genIndex].setWeights(weights[genIndex]);
		}

		this.genomes = nextGenomes;
	}

	//
	mutationWithRate(nextGenomes) {
		var weights = [];

		// Store all the weights in an array
		for (var g = 0; g < nextGenomes.length; g++) {
			weights.push(nextGenomes[g].getWeights());
		}

		// Number of values that will change
		var nbValuesToChange;

		// Apply random mutation to each genomes
		for (var genIndex = 0; genIndex < weights.length; genIndex++) {

			// Change the weights randomly
			for (var i = 0; i < weights[genIndex].length; i++) {
				if (this.rate <= Math.random()) {
					weights[genIndex][i] += Math.random() - 0.5;
				}
			}

			// Apply the changes
			nextGenomes[genIndex].setWeights(weights[genIndex]);
		}

		this.genomes = nextGenomes;
	}
}

function twoPointCrossover(breedA, breedB){

}

function uniformCrossover(breedA, breedB, rate){

}