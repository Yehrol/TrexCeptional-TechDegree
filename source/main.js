/***********************************************************
* Author : De Biasi Loris
* Description : 
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

// Set the state of the AI
var isRunning = false;

// Store the current game index (1 is the trex game)
var currentGameIndex = 1;

// Game variable
var runner;

//
var games = {
	TREX: 1,
	FLAPPY: 2
}

// Neural net variable
var gen;

// Resfresh rate of the AI [FPS]
var AIResfreshRate = 60;

// Var to calculate fitness
var fitness = 0;
var lastValue = 1000;

// Max values
var maxVelocity;
var maxDistance;
var maxYPosition;
var maxSize;

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
	            lineTension: 0.2,
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

    // Instanciate the game
    //runner = new Runner('.interstitial-wrapper');
    runner = new flappyBird();
    log(runner);

    // Get the max values [trex]
   /* maxVelocity = runner.config.MAX_SPEED;
	maxDistance = 600 + 25;
	maxYPosition = 105;
	maxSize = runner.config.MAX_OBSTACLE_LENGTH;*/

	// Neural net configuration
	var topology = [1,2,1];
	var numberOfGenomes = 12; //Genomes per generation [minimum 4]
	var activation = new sigmoid();
	var selectionMethod = new rouletteWheelSelection();
	var crossoverMethod = new singlePointCrossover();
	var mutationMethod = new mutationWithRate(0.2); // [0..1]

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
				runner = new Runner('.interstitial-wrapper');
				log("test");
			}
			else if (currentGameIndex == games.FLAPPY) {
				
			}
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
			gameValue = ;
		}

		startIA(gameValue);
	}, 1000 / AIResfreshRate);
});

// Change the state of the AI
function changeRunningState() {
	// Change the state
	isRunning = !isRunning;

	// Show if the AI is started or stopped
	if (isRunning == true) {
		$("#stateBtn").html('STOP<i class="material-icons right">power_settings_new</i>');
		Materialize.toast('AI Started', 4000);

		// Unpause the trex game
		runner.play();
		// Simulate key press to start the game
		simulateKeyPress(38, "keydown");
	}
	else{
		$("#stateBtn").html('START<i class="material-icons right">power_settings_new</i>');
		Materialize.toast('AI Stopped', 4000);

		// Stop the trex game
		runner.stop();
	}
}

// 
function startIA(gameValue) {
    // Show some value for debuging
    $('#Velocity').html(gameValue[0]);
    $('#Distance').html(gameValue[1]);
    $('#yPosition').html(gameValue[2]);
    $('#Size').html(gameValue[3]);

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

		// Normalized data
		var normalizedVelocity = gameValue[0] / maxVelocity;
	    var normalizedDistance = gameValue[1] / maxDistance;
	    var normalizedYPosition = gameValue[2] / maxYPosition;
	    var normalizedSize = gameValue[3] / maxSize;

	    // Create the input array for the neural network
		var input = [normalizedDistance];//,normalizedVelocity,normalizedSize,normalizedYPosition

		// Run the generation
		var result = gen.run(input);

		// Make a game action
		trexAction(result);

		// Get the number of obstacle passed
		if (gameValue[1] > lastValue) {
			fitness++;
		}
		lastValue = gameValue[1];

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
}

function flappyAction(result) {
	// Make action depending the neural net output
	if (result > 0.5) { // greater than 0.5 [press up]
		//this.birds[0].flap()
	}	
}

function trexAction(result) {
	// Make action depending the neural net output
	if (result > 0.6) { // greater than 0.5 [press up]
		simulateKeyPress(38, "keydown");
	}
	else if (result < 0.4) { // less than 0.4 [press down]
		simulateKeyPress(40, "keydown");
	}
	else {
		//do nothing
	}
}

// Update the interface
function updateInterface() {
	$('#generationIndex').html(gen.generation + 1);
	$('#genomeIndex').html(gen.currentGenome + 1 + "/" + gen.genomes.length);
}

//
function restartGame() {
	simulateKeyPress(38, "keyup");
	ctx.clearRect(0,0,c.width,c.height);
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