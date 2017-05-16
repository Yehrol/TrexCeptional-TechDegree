/***********************************************************
* Author : De Biasi Loris
* Description : 
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

var lastValue = 1000;

class Generation {
	constructor(pTopology, pNbOfGenome, pActivationFunction, pRate) {
		this.genomes = [];
		if (pNbOfGenome < 4) {
			this.numberOfGenomes = 4;
		}
		else {
			this.numberOfGenomes = pNbOfGenome;
		}
		this.generation = 0;
		this.currentGenome = 0;
		this.rate = pRate;
		//(Math.random() - 0.5) * 3 + (Math.random() - 0.5)

		// Forced to store them to create a new object from the object himself
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
		var input = [normalizedDistance];//,normalizedVelocity,normalizedSize,normalizedYPosition
		//log("velocity : " + normalizedVelocity);
		//log("distance : " + normalizedDistance);
		//log("y position : " + normalizedYPosition);
		//log("size : " + normalizedSize);

		for (var genomeIndex = 0; genomeIndex < this.genomes.length; genomeIndex++) {
			// Feed the neural network with the normalized T-Rex value
    		this.genomes[genomeIndex].feedForward(input);

    		// Check which move the AI should do
			var result = this.genomes[genomeIndex].getOutput();

			//BUG HERE !! ? some actions are strange (when trex dies)
			if (typeof runner.tRex[genomeIndex] != "undefined") {
				if (pDistance > lastValue) {
					this.genomes[genomeIndex].fitness++;
				}

				if (result > 0.6) {
					runner.tRex[genomeIndex].setDuck(false);
					runner.tRex[genomeIndex].speedDrop = false;
					runner.tRex[genomeIndex].startJump(runner.currentSpeed);
					//simulateKeyPress(38, "keydown");
				} 
				else if (result < 0.4) {
					runner.tRex[genomeIndex].setDuck(true);
					runner.tRex[genomeIndex].setSpeedDrop();
					runner.tRex[genomeIndex].endJump();
					//simulateKeyPress(40, "keydown");
				}
				else {
					runner.tRex[genomeIndex].speedDrop = false;
					runner.tRex[genomeIndex].setDuck(false);
					runner.tRex[genomeIndex].endJump();
				}
			}
		}

		lastValue = pDistance;

		

		
		//$("#decision").html(result.toFixed(3));


		
	}

	//
	nextGen(pFitnessChart) {
		// Store the score of the current genome
		//this.genomes[this.currentGenome].setFitness(pFitness); // PROBLEM HERE.

		// Change the generation if we used all the genomes
		//if (this.currentGenome >= this.genomes.length - 1) {
			// Reset the current genome number
			//this.currentGenome = 0;

			// Change the generation
			this.generation++;

			addDataToChart(pFitnessChart,this.getFitness());

			// Do crossover
			this.selection();
		//}
		/*else {
			this.currentGenome++;
		}*/
	}

	getFitness() {
		return this.getBestFitness();
	}

	//
	getFitnessAverage() {
		// Get the fitness average of the generation
		var fitnessAverage = 0;
		for (var i = 0; i < this.genomes.length; i++) {
			fitnessAverage += this.genomes[i].fitness;
		}
		fitnessAverage /= this.genomes.length;

		return fitnessAverage;
	}

	getBestFitness() {
		var bestFitness = 0;
		for (var i = 0; i < this.genomes.length; i++) {
			if (bestFitness < this.genomes[i].fitness) {
				bestFitness = this.genomes[i].fitness;
			}
		}

		return bestFitness;
	}

	//
	selection() {
		//this.bestSelection();
		this.rouletteWheelSelection();
		//this.bestSelection();
	}

	bestSelection(){
		// Store the best genome
		var selected = [];
		var tmpWeight = [];
		var genomeToAppend;
		var max = -1;
		var genClone;
		var indexToRemove;

		// Create a clone of the genomes
		genClone = new Generation(this.topology, this.numberOfGenomes, this.activationFunction, this.rate);

		// Get all the weights of the generation
		for (var g = 0; g < this.genomes.length; g++) {
			tmpWeight.push(this.genomes[g].getWeights());
		}

		//log(this.genomes);

		// Set all the weights to the tmp generation (copy)
		for (var g = 0; g < this.genomes.length; g++) {
			genClone.genomes[g].setWeights(tmpWeight[g]);
		}
		//

		// Set the fitness
		for (var i = 0; i < this.genomes.length; i++) {
			genClone.genomes[i].setFitness(this.genomes[i].fitness);
		}

		// Select the best genomes [2 * (sqrt(nbOfGenomes) / 2)]
		for (var i = 0; i < 2*Math.floor(Math.sqrt(this.genomes.length)/2); i++) { // Number of wanted genomes for breeding
			max = -1;
			// Check the best fitness
			for (var j = 0; j < genClone.genomes.length; j++) {
				// If a genome as a higher score
				if (max < genClone.genomes[j].fitness) {
					max = genClone.genomes[j].fitness;

					// Store the best genome
					genomeToAppend = genClone.genomes[j];
					indexToRemove = j;
					//log(indexToRemove);
				}
			}
			//log(arrayClone);
			selected.push(genomeToAppend);

			// Remove the genome from the copied array
			//log(indexToRemove);
			genClone.genomes.splice(indexToRemove, 1);
			//log(genClone.genomes);
		}

		this.crossover(selected);
	}

	//
	rouletteWheelSelection() {
		var selected = [];
		var numberOfWantedParents = 2*Math.floor(Math.sqrt(this.genomes.length)/2);

		for (var i = 0; i < numberOfWantedParents; i++) { // Number of wanted genomes for breeding
			var weightSum = 0;
			// Get the total fitness
			for (var genomeIndex = 0; genomeIndex < this.genomes.length; genomeIndex++) {
				weightSum += (this.genomes[genomeIndex].fitness + 0.1); // +1 because some can have 0 fitness
			}

			// Get a random value
			var treshold = Math.random() * weightSum;
			var sum = 0;

			// Select a genome
			for (var genomeIndex = 0; genomeIndex < this.genomes.length; genomeIndex++) {
				sum += this.genomes[genomeIndex].fitness + 0.1;
				if (sum > treshold) {
					//log(this.genomes[genomeIndex]);
					selected.push(this.genomes[genomeIndex]);
					this.genomes.splice(genomeIndex, 1)
					//log(this.genomes);
					break;
				}
			}
		}
		//log("--------------------");

		this.crossover(selected);
	}

	// 
	crossover(pSelectedGenomes) {
		this.singlePointCrossover(pSelectedGenomes);
	}

	//
	singlePointCrossover(pSelectedGenomes){
		var children = [];
		// Create a copy of the genomes
		var genClone = new Generation(this.topology, this.numberOfGenomes, this.activationFunction, this.rate);
		var weights = [];

		// Store all the weights in an array
		for (var g = 0; g < pSelectedGenomes.length; g++) {
			weights.push(pSelectedGenomes[g].getWeights());
		}

		// For each genome minus the number of selected genomes divided by 2
		for (var genIndex = 0; genIndex < this.genomes.length - (pSelectedGenomes.length / 2); genIndex++) {
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

		// Generate a random genomes
		for (var genIndex = this.genomes.length - (pSelectedGenomes.length / 2); genIndex < this.genomes.length; genIndex++) {
			genClone.genomes[genIndex] = new Genome(this.topology, this.activationFunction);
		}

		//log(pSelectedGenomes[0].getWeights());
		//log(pSelectedGenomes[1].getWeights());
		//log(genClone.genomes[0].getWeights());

		// Assign the new generation
		this.mutation(genClone.genomes);
	}

	twoPointCrossover(pSelectedGenomes){

	}

	uniformCrossover(pSelectedGenomes, rate){

	}

	//
	mutation(nextGenomes) {
		this.mutationWithRate(nextGenomes);
	}

	//
	mutationWithoutRate(nextGenomes) {
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
				/*if (weights[genIndex][indexArray[i]] < 0) {
					weights[genIndex][indexArray[i]] = 0;
				}*/
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
					weights[genIndex][i] += Math.random() * 0.4 - 0.2; // [-0.2...0.2]
				}
			}

			// Apply the changes
			nextGenomes[genIndex].setWeights(weights[genIndex]);
		}

		//log(nextGenomes[0].getWeights());
		//log(this.genomes[0].getWeights());

		this.genomes = nextGenomes;
	}

	drawNeuralNet(canvas, context, genomeIndex) {
		this.genomes[genomeIndex].drawNeuralNet(canvas,context);
	}
}