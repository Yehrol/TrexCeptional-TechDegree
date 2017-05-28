class gameManager {
	//
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

class trexManager extends gameManager {
	constructor() {
		// Parent constructor
		super();

		this.defaultTopology = [2,2,1]; //4,4,1
		this.defaultNumberOfGenomes = 12;
		this.tmpFitness = 0;
		this.lastXpos = 1000;
	}

	instanciateGame() {
		return new Runner('.interstitial-wrapper');
	}

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

		    inputs = [normalizedDistance,normalizedYPosition];//,normalizedVelocity,normalizedSize
		}

		return inputs;
	}

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

	fitness(game) {
		if (game.horizon.obstacles[0].xPos > this.lastXpos) {
			this.tmpFitness++;
		}
		this.lastXpos = game.horizon.obstacles[0].xPos;
	}

	isDead(game) {
		return game.crashed;
	}

	play(game) {
		// Unpause the trex game
		game.play();
		// Simulate key press to start the game
		simulateKeyPress(38, "keydown");
	}

	pause(game) {
		game.stop();
	}

	restart(game) {
		this.tmpFitness = 0;
		this.lastXpos = 1000;
		game.restart();
	}
}

class flappyManager extends gameManager {
	constructor() {
		// Parent constructor
		super();
		
		this.defaultTopology = [2,2,1];
		this.defaultNumberOfGenomes = 60;
		this.tmpFitness = 0;
	}

	instanciateGame() {
		return new flappyBird();
	}

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

	action(game, result) {
		// Make action depending the neural net output
		if (result > 0.5) { // greater than 0.5 [press up]
			game.game.birds[0].flap();
		}
	}

	fitness(game) {
		this.tmpFitness = game.game.score;
	}

	isDead(game) {
		return game.game.isItEnd();
	}

	play(game) {
		game.game.run = true;
	}

	pause(game) {
		game.game.run = false;
	}

	restart(game) {
		this.tmpFitness = 0;
		game.game.start();
	}
}