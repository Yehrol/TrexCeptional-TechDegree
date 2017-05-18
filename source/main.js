/***********************************************************
* Author : De Biasi Loris
* Description : 
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

// Set the state of the AI
var isRunning = false;

//
var games = {
	TREX: 1,
	FLAPPY: 2
}

// Store the current game index (1 is the trex game)
var currentGameIndex = games.FLAPPY;

// Game variable
var runner;

// Neural net variable
var gen;

// Resfresh rate of the AI [FPS]
var AIResfreshRate = 180;

// Var to calculate fitness
var fitness = 0;
var lastValue = 1000;

// Reference to the fitness chart
var fitnessChart;

// Canvas
var c = document.getElementById("neuralNet");
var ctx = c.getContext("2d");

// Get the canvas of the neural net visualisation
var neuralNetCanvas = document.getElementById('neuralNet');

// Var used for the timer
var timer = 0;
var timePassed = 0;

// When the page is fully loaded
$(document).ready(function(){
    // Enable the modals and configure them
    $('.modal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        inDuration: 300, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '4%', // Starting top style attribute
        endingTop: '10%', // Ending top style attribute
        ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            //console.log(modal, trigger);
        },
        complete: function() { // Callback for Modal close
            //Clear the modals on close
            clearModals();
        }
    });

	// Configuration of the chart
    var data = {
	    datasets: [
	        {
	            label: "Best fitness",
	            fill: true,
	            lineTension: 0.1,
	            backgroundColor: "rgba(75,192,192,0.4)",
	            borderColor: "rgba(75,192,192,1)",
	            borderCapStyle: 'butt',
	            borderDash: [],
	            borderDashOffset: 0.0,
	            borderJoinStyle: 'miter',
	            pointBorderColor: "rgba(75,192,192,1)",
	            pointBackgroundColor: "#fff",
	            pointBorderWidth: 1,
	            pointHoverRadius: 5,
	            pointHoverBackgroundColor: "rgba(75,192,192,1)",
	            pointHoverBorderColor: "rgba(220,220,220,1)",
	            pointHoverBorderWidth: 2,
	            pointRadius: 5,
	            pointHitRadius: 10,
	            spanGaps: false,
	        }
	    ]
	};

	//Creation of the empty chart
    var chartCtx = document.getElementById("Chart");
	fitnessChart = new Chart(chartCtx, {
	    type: 'line',
	    data: data,
	    options: {
	        title: {
	            display: true,
	            text: 'Best fitness over generations' // Title
	        }
	    }
	});

    // Event when a file is loaded
    document.getElementById('selectedFile').addEventListener('change', readSingleFile, false);

    // Call "resizeNeuralNetCanvas" when the window has been resized
    window.addEventListener('resize', resizeNeuralNetCanvas, false);

	// Enable the selector
	$(document).ready(function() {
		$('select').material_select();
	});

	// Neural net configuration
	var topology;
	var numberOfGenomes = 50; //Genomes per generation [minimum 4]
	var activation = new sigmoid();
	var selectionMethod = new rouletteWheelSelection();
	var crossoverMethod = new singlePointCrossover();
	var mutationMethod = new mutationWithRate(0.2); // [0..1]

    // Instanciate the game
    if (currentGameIndex == games.TREX) {
    	$("select[name=gameSelector] option[value=1]").prop('selected', 'selected');
    	topology = [1,2,1];
    	//topology = [4,4,1];
    	runner = new Runner('.interstitial-wrapper');
    }
    else if (currentGameIndex == games.FLAPPY) {
    	$("select[name=gameSelector] option[value=2]").prop('selected', 'selected');
    	topology = [3,3,1];
    	runner = new flappyBird();
    }

	// Create a new generation
    gen = new Generation(topology, numberOfGenomes, activation, selectionMethod, crossoverMethod, mutationMethod);

	// Update the interface
	updateInterface();

    // Resize the canvas depending the container size
    resizeNeuralNetCanvas();

	// Event when the game is changed
	$( "select[name=gameSelector]" ).change(function() {
		// Check if the selected option is the same as before
		if (currentGameIndex != $('select[name=gameSelector]').val()) {
			currentGameIndex = $('select[name=gameSelector]').val();

			// Change the game depending the option selected
			if (currentGameIndex == games.TREX) {
				$('.interstitial-wrapper').html('<div id="main-content"><div class="icon icon-offline" alt="" style="visibility: hidden;"></div></div>');
				$('.interstitial-wrapper').append('<div id="offline-resources"><img id="offline-resources-1x" src="assets/default_100_percent/100-offline-sprite.png"><img id="offline-resources-2x" src="assets/default_200_percent/200-offline-sprite.png"></div>');
				runner = new Runner('.interstitial-wrapper');

				topology = [1,2,1];
				gen = new Generation(topology, numberOfGenomes, activation, selectionMethod, crossoverMethod, mutationMethod);
				// Draw the neural net
				gen.drawNeuralNet(c,ctx);
				fitnessChart.data.datasets[0].data = null;
			}
			else if (currentGameIndex == games.FLAPPY) {
				runner = new flappyBird();

				topology = [3,3,1];
				gen = new Generation(topology, numberOfGenomes, activation, selectionMethod, crossoverMethod, mutationMethod);
				// Draw the neural net
				gen.drawNeuralNet(c,ctx);
				fitnessChart.data.datasets[0].data = null;
			}

			changeRunningState(false);
		}
	});
    
    // 
	setInterval(function(){
		var gameValue
		if (currentGameIndex == games.TREX) {
			// Start when the first obstacle appear [TO CHANGE DEPENDING THE GAME]
			if (typeof runner.horizon.obstacles[0] != "undefined") {
				gameValue = [parseFloat(runner.currentSpeed.toFixed(3)), parseFloat(runner.horizon.obstacles[0].xPos), parseFloat(runner.horizon.obstacles[0].yPos), parseFloat(runner.horizon.obstacles[0].size)];
			}
		}
		else if (currentGameIndex == games.FLAPPY) {
			if (typeof runner.game.backgroundSpeed != "undefined") {
				if (runner.game.pipes.length > 0) {
					gameValue = [runner.game.backgroundSpeed, runner.game.birds[0].y, runner.game.pipes];
				}
			}
		}

		if (typeof gameValue != "undefined") {
			startIA(gameValue);
		}
	}, 1000 / AIResfreshRate);
});

// Change the state of the AI
function changeRunningState(state) {
	if (typeof state == "undefined") {
		// Change the state
		isRunning = !isRunning;
	}
	else {
		isRunning = state;
	}

	// Show if the AI is started or stopped
	if (isRunning == true) {
		$("#stateBtn").html('STOP<i class="material-icons right">power_settings_new</i>');
		Materialize.toast('AI Started', 4000);

		if (currentGameIndex == games.TREX) {
			// Unpause the trex game
			runner.play();
			// Simulate key press to start the game
			simulateKeyPress(38, "keydown");
		}
		else if (currentGameIndex == games.FLAPPY) {
			runner.game.run = true;
		}
	}
	else{
		$("#stateBtn").html('START<i class="material-icons right">power_settings_new</i>');
		Materialize.toast('AI Stopped', 4000);

		if (currentGameIndex == games.TREX) {
			// Stop the trex game
			runner.stop();
		}
		else if (currentGameIndex == games.FLAPPY) {
			runner.game.run = false;
		}
	}
}

// 
function startIA(gameValue) {
    // Show some value for debuging

    /*$('#Velocity').html(gameValue[0]);
    $('#Distance').html(gameValue[1]);
    $('#yPosition').html(gameValue[2]);
    $('#Size').html(gameValue[3]);*/

	// Check if the AI should "run"
	if (isRunning == true) {
		// Draw the neural net
		gen.drawNeuralNet(c,ctx);

		// timer
		timer++;
		if (timer >= AIResfreshRate) {
			timePassed++;
			$("#timeIndex").html(timePassed);
			timer = 0;
		}

		var input;

		if (currentGameIndex == games.TREX) {
			// Normalized data
			var normalizedVelocity = gameValue[0] / runner.config.MAX_SPEED;
		    var normalizedDistance = gameValue[1] / (600 + 25);
		    var normalizedYPosition = gameValue[2] / 105;
		    var normalizedSize = gameValue[3] / runner.config.MAX_OBSTACLE_LENGTH;

	    	// Create the input array for the neural network
			input = [normalizedDistance];//,normalizedVelocity,normalizedSize,normalizedYPosition
		}
		else if (currentGameIndex == games.FLAPPY) {
			//flappy bird
		    var nomalizedBgSpeed = gameValue[0];
		    var normalizedY = gameValue[1] / 500;
		    var normalizedPipe1;
		    var normalizedPipe2;

		    if (runner.game.birds[0].x <= gameValue[2][1].x) {
		    	normalizedPipe1 = gameValue[2][0].height / 330;
		    	normalizedPipe2 = (gameValue[2][1].height - gameValue[2][1].y) / 450;
		    }
		    else if (runner.game.birds[0].x > gameValue[2][1].x) {
		    	normalizedPipe1 = gameValue[2][2].height / 330;
		    	normalizedPipe2 = (gameValue[2][3].height - gameValue[2][3].y) / 450;
		    }
		    else if (runner.game.birds[0].x > gameValue[2][3].x) {
		    	normalizedPipe1 = gameValue[2][4].height / 330;
		    	normalizedPipe2 = (gameValue[2][5].height - gameValue[2][3].y) / 450;
		    }

		    // Create the input array for the neural network
		    input = [normalizedY,normalizedPipe1,normalizedPipe2];
		}

		// Run the generation
		var result = gen.run(input);

		// Make a game action
		gameAction(currentGameIndex, result);

		if (currentGameIndex == games.TREX) {
			// Get the number of obstacle passed [Trex]
			if (gameValue[1] > lastValue) {
				fitness++;
			}
			lastValue = gameValue[1];
		}
		else if (currentGameIndex == games.FLAPPY) {
			fitness = runner.game.score**4;
		}
		
		if (currentGameIndex == games.TREX) {
			// When the AI die
			if (runner.crashed) {
				// Restart the game
				restartGame();

				// Check if the game has restarted before changing generation
				if (!runner.crashed) {
					// Change the generation and save the fitness
					gen.nextGen(fitness, fitnessChart);

					// Reset the value (counting obstacle)
					fitness = 0;
					lastValue = 1000

					updateInterface();
				}
			}
		}
		else if (currentGameIndex == games.FLAPPY) {
			// When the AI die
			if (runner.game.isItEnd()) {
				// Restart the game
				restartGame();

				// Change the generation and save the fitness
				gen.nextGen(fitness, fitnessChart);

				// Reset the value (counting obstacle)
				fitness = 0;
				lastValue = 1000

				updateInterface();
			}
		}
	}
}

function gameAction(game, result) {
	if (game == games.TREX) {
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
	else if (game == games.FLAPPY) {
		// Make action depending the neural net output
		if (result > 0.5) { // greater than 0.5 [press up]
			runner.game.birds[0].flap();
			//this.birds[0].flap()
		}
	}
}

// Update the interface
function updateInterface() {
	$('#generationIndex').html(gen.generation + 1);
	$('#genomeIndex').html(gen.currentGenome + 1 + "/" + gen.genomes.length);
}

//
function restartGame() {
	ctx.clearRect(0,0,c.width,c.height);

	if (currentGameIndex == games.TREX) {
		simulateKeyPress(38, "keyup");
	}
	else if (currentGameIndex == games.FLAPPY) {
		runner.game.start();
	}
}


/*

*/



// Resize the canvas depending de windows size
function resizeNeuralNetCanvas() {
    neuralNetCanvas.width = $("#neuralNetPreview").width();
    neuralNetCanvas.height = $("#neuralNetPreview").height();

    // Redraw the neural net after changing the size
    gen.drawNeuralNet(c,ctx);
}

// Add a fitness to a chart
function addDataToChart(chart,fitness) {
	var chartLength = chart.data.datasets[0].data.length;

	chart.data.datasets[0].data[chartLength] = fitness;
	chart.data.labels[chartLength] = "Gen " + (chartLength + 1);
	chart.update();
}


// Simulate a key press
// 38=up, 40=down, 32=space
// "keyup", "keydown"
function simulateKeyPress(keycode, type) {
	var evt = new Event(type);
	evt.keyCode=keycode;
	evt.which=evt.keyCode;
	document.dispatchEvent(evt);
}

// Download the neural network (exported neural network)
function downloadFile(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    Materialize.toast('Neural network succesfully exported', 4000);
}

// Read a file and print it in a textarea
function readSingleFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var file = evt.target.files[0]; 

    // If the file exist/is selected
    if (file) {
        var reader = new FileReader();

        // Load the file
        reader.onload = function(e) { 
            // Get the file data
            var contents = e.target.result;

            // Add the content to the textarea
            $("#textareaImport").val(contents);
        }

        // Read the text file
        reader.readAsText(file);
    } else { 
        Materialize.toast('Failed to load file', 4000);
    }
}

// Clear the modals
function clearModals() {
    $('.modal').find('input:text, input:password, select, textarea').val('');
    $('.modal').find('input:radio, input:checkbox').prop('checked', false);
}

// Save the change on the neural network
function saveChange(){
    Materialize.toast('Neural network succesfully modified', 4000)
}

// Import a neural network
function importNeuralNetwork(){
    $('#importModal').modal('close');
    Materialize.toast('Neural network succesfully imported', 4000)
}

// Transform a multidimensionnal array into an 1 dimension array
function ravel(array) {
	var result = new Array();
	//log(typeof array[0]);
	//log(array[0]);
	if (typeof array[0] == "undefined" || typeof array[0] == "number") {//TO CHANGE
		result = array;
	}
	else {
		for (var i = 0; i < array.length; i++) {
			for (var j = 0; j < array[i].length; j++) {
				result.push(array[i][j]);
			}
		}
	}

	return result;
}

// For debug (faster)
function log(msg) {
	console.log(msg);
}