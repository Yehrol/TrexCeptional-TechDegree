class gameManager {
	//
	constructor() {
		if (new.target === activationFunction) {
			throw new TypeError("Cannot construct activationFunction instances directly");
		}
	}

	getNormalizedInputValues() {}
	action() {}
	fitness() {}
	isDead() {}
	play() {}
	pause() {}
	restart() {}
}

class trexManager extends gameManager {
	constructor() {
		// Parent constructor
		super();

		this.defaultTopology = [1,2,1];
		this.defaultNumberOfGenomes = 12;
	}

	getNormalizedInputValues() {

	}

	action() {

	}

	fitness() {

	}

	isDead() {

	}

	play() {

	}

	pause() {

	}

	restart() {

	}
}

class flappyManager extends gameManager {
	constructor() {
		// Parent constructor
		super();
		
		this.defaultTopology = [2,2,1];
		this.defaultNumberOfGenomes = 50;
	}

	
}

/*
inputValue
normalizedValue
fitnessCalcul
isDead
makeAction
restart

play
pause
*/