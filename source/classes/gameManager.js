/***********************************************************
* Author : De Biasi Loris
* Description : The game manager class. Allows to add
*			    games easily
* Version : 0.1
* Date : 22.05.2017
***********************************************************/

/** Abstract class for game manager */
class gameManager {
	constructor() {
		if (new.target === gameManager) {
			throw new TypeError("Cannot construct gameManager instances directly");
		}
	}

	instanciateGame() { throw new Error("Must override method"); }
	getNormalizedInputValues(game) { throw new Error("Must override method"); }
	action(game, result) { throw new Error("Must override method"); }
	fitness(game) { throw new Error("Must override method"); }
	isDead(game) { throw new Error("Must override method"); }
	play(game) { throw new Error("Must override method"); }
	pause(game) { throw new Error("Must override method"); }
	restart(game) { throw new Error("Must override method"); }
}

/**
 * Trex game manager
 * @extends gameManager
 */
class trexManager extends gameManager {
	/**
	 * Create a trex manager.
 	 * @constructor
	 */
	constructor() {
		// Parent constructor
		super();

		this.defaultTopology = [1,1,1]; //4,4,1
		this.defaultNumberOfGenomes = 12;
		this.tmpFitness = 0;
		this.lastXpos = 1000;
	}

	/**
	 * Create a trex manager.
	 * @return {game} The game
	 */
	instanciateGame() {
		return new Runner('.interstitial-wrapper');
	}

	/**
	 * Get the normalized input values
     * @param {game} game - The game
	 * @return {number} The input
	 */
	getNormalizedInputValues(game) {
		var inputs = [];

		if (typeof game.horizon.obstacles[0] != "undefined") {
			var maxVelocity = 13;
			var maxDistance = 600 + 25;
			var maxYPosition = 105;
			var maxSize = 3;

			var normalizedVelocity = game.currentSpeed.toFixed(3) / maxVelocity;
		    var normalizedDistance = game.horizon.obstacles[0].xPos / maxDistance;
		    var normalizedYPosition = game.horizon.obstacles[0].yPos / maxYPosition;
		    var normalizedSize = game.horizon.obstacles[0].size / maxSize;

		    inputs = [normalizedDistance];//,normalizedYPosition,normalizedSize,normalizedVelocity
		}

		return inputs;
	}

	/**
	 * Make an action depending the result
     * @param {game} game - The game
     * @param {game} result - The result
	 */
	action(game, result) {
		// Make action depending the neural net output
		if (result > 0.6) { // greater than 0.6 [press up]
			simulateKeyPress(38, "keydown");
		}
		else if (result < 0.4) { // less than 0.4 [press down]
			simulateKeyPress(40, "keydown");
		}
		else {
			//do nothing
		}
	}

	/**
	 * Update the fitness
     * @param {game} game - The game
	 */
	fitness(game) {
		if (game.horizon.obstacles[0].xPos > this.lastXpos) {
			this.tmpFitness++;
		}
		this.lastXpos = game.horizon.obstacles[0].xPos;
	}

	/**
	 * Check if the player is dead
     * @param {game} game - The game
	 * @return {boolean} The status of the game
	 */
	isDead(game) {
		return game.crashed;
	}

	/**
	 * Unpause the game
     * @param {game} game - The game
	 */
	play(game) {
		// Unpause the trex game
		game.play();
		// Simulate key press to start the game
		simulateKeyPress(38, "keydown");
	}

	/**
	 * Pause the game
     * @param {game} game - The game
	 */
	pause(game) {
		game.stop();
	}

	/**
	 * Restart the game
     * @param {game} game - The game
	 */
	restart(game) {
		this.tmpFitness = 0;
		this.lastXpos = 1000;
		game.restart();
	}
}

/**
 * Flappy game manager
 * @extends gameManager
 */
class flappyManager extends gameManager {
	/**
	 * Create a flappy manager.
 	 * @constructor
	 */
	constructor() {
		// Parent constructor
		super();
		
		this.defaultTopology = [2,2,1];
		this.defaultNumberOfGenomes = 60;
		this.tmpFitness = 0;
	}

	/**
	 * Create a trex manager.
	 * @return {game} The game
	 */
	instanciateGame() {
		return new flappyBird();
	}

	/**
	 * Get the normalized input values
     * @param {game} game - The game
	 * @return {number} The input
	 */
	getNormalizedInputValues(game) {
		var inputs = [];

		if (typeof game.game.backgroundSpeed != "undefined") {
			if (game.game.pipes.length > 0) {
				var normalizedY = game.game.birds[0].y / game.game.height;
			    var normalizedPipe;

			    var nextHoll = 0;
				for(var i = 0; i < game.game.pipes.length; i+=2){
					if(game.game.pipes[i].x + game.game.pipes[i].width > game.game.birds[0].x){
						nextHoll = game.game.pipes[i].height/game.game.height;
						break;
					}
				}

				normalizedPipe = nextHoll;

			    // Create the input array for the neural network
			    inputs = [normalizedY,normalizedPipe];
			}
		}

		return inputs;
	}

	/**
	 * Make an action depending the result
     * @param {game} game - The game
     * @param {game} result - The result
	 */
	action(game, result) {
		// Make action depending the neural net output
		if (result > 0.5) { // greater than 0.5 [press up]
			game.game.birds[0].flap();
		}
	}

	/**
	 * Update the fitness
     * @param {game} game - The game
	 */
	fitness(game) {
		this.tmpFitness = game.game.score;
	}

	/**
	 * Check if the player is dead
     * @param {game} game - The game
	 * @return {boolean} The status of the game
	 */
	isDead(game) {
		return game.game.isItEnd();
	}

	/**
	 * Unpause the game
     * @param {game} game - The game
	 */
	play(game) {
		game.game.run = true;
	}

	/**
	 * Pause the game
     * @param {game} game - The game
	 */
	pause(game) {
		game.game.run = false;
	}

	/**
	 * Restart the game
     * @param {game} game - The game
	 */
	restart(game) {
		this.tmpFitness = 0;
		game.game.start();
	}
}