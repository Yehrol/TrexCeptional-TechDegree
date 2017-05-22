/***********************************************************
* Author : De Biasi Loris
* Description : 
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

// Set the state of the AI
var isRunning = false;

var myGameManager;

//
var games = {
	TREX: 1,
	FLAPPY: 2
}

var activation;
var selectionMethod;
var crossoverMethod;
var mutationMethod;

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

// Resfresh rate for the neural net preview
var nnPreviewCounter = 0;
var nnPreviewRefreshRate = 10; // [FPS]

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
	$(document).ready(function() { $('select').material_select(); });

	// Neural net configuration
	activation = new sigmoid();
	selectionMethod = new rouletteWheelSelection();
	crossoverMethod = new singlePointCrossover();
	mutationMethod = new mutationWithRate(0.2); // [0..1]

    // Instanciate the game
    if (currentGameIndex == games.TREX) {
    	$("select[name=gameSelector] option[value=1]").prop('selected', 'selected');

    	myGameManager = new trexManager();
    }
    else if (currentGameIndex == games.FLAPPY) {
    	$("select[name=gameSelector] option[value=2]").prop('selected', 'selected');

    	myGameManager = new flappyManager();
    }

    runner = myGameManager.instanciateGame();

	// Create a new generation
    gen = new Generation(myGameManager.defaultTopology, myGameManager.defaultNumberOfGenomes, activation, selectionMethod, crossoverMethod, mutationMethod);

	// Update the interface
	updateInterface();

    // Resize the canvas depending the container size
    resizeNeuralNetCanvas();

	// Event when the game is changed
	$( "#neuralNetSelector" ).change(function() {
		printSelectedNeuralNet($('#neuralNetSelector').val());
	});

	// Event when the game is changed
	$( "select[name=gameSelector]" ).change(function() {
		// Check if the selected option is the same as before
		if (currentGameIndex != $('select[name=gameSelector]').val()) {
			currentGameIndex = $('select[name=gameSelector]').val();

			// Change the game depending the option selected
			if (currentGameIndex == games.TREX) {
				$('.interstitial-wrapper').html('<div id="main-content"><div class="icon icon-offline" alt="" style="visibility: hidden;"></div></div>');
				$('.interstitial-wrapper').append('<div id="offline-resources"><img id="offline-resources-1x" src="assets/default_100_percent/100-offline-sprite.png"><img id="offline-resources-2x" src="assets/default_200_percent/200-offline-sprite.png"></div>');
				myGameManager = new trexManager();
			}
			else if (currentGameIndex == games.FLAPPY) {
				myGameManager = new flappyManager();
			}

			runner = myGameManager.instanciateGame();

			gen = new Generation(myGameManager.defaultTopology, myGameManager.defaultNumberOfGenomes, activation, selectionMethod, crossoverMethod, mutationMethod);
			// Draw the neural net
			gen.drawNeuralNet(c,ctx);
			fitnessChart.data.datasets[0].data = null;

			changeRunningState(false);
		}
	});
    
    // 
	setInterval(function(){
		startAI();
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

		myGameManager.play(runner);
	}
	else{
		$("#stateBtn").html('START<i class="material-icons right">power_settings_new</i>');
		Materialize.toast('AI Stopped', 4000);

		myGameManager.pause(runner);
	}
}

// 
function startAI() {
    /*$('#Velocity').html(gameValue[0]);
    $('#Distance').html(gameValue[1]);
    $('#yPosition').html(gameValue[2]);
    $('#Size').html(gameValue[3]);*/

	// Check if the AI should "run"
	if (isRunning == true) {
		var gameValue = myGameManager.getNormalizedInputValues(runner);

		if (gameValue.length > 0) {

			// timer
			timer++;
			if (timer >= AIResfreshRate) {
				timePassed++;
				$("#timeIndex").html(timePassed);
				timer = 0;
			}

			// Neural net preview
			nnPreviewCounter++;
			if (nnPreviewCounter >= (AIResfreshRate / nnPreviewRefreshRate)) {
				// Draw the neural net
				gen.drawNeuralNet(c,ctx);
				nnPreviewCounter = 0;
			}

			// Run the generation
			var result = gen.run(gameValue);

			// Make a game action
			myGameManager.action(runner, result);

			myGameManager.fitness(runner);
			
			// When the AI die
			if (myGameManager.isDead(runner)) {
				// Restart the game
				myGameManager.restart(runner);

				// Change the generation and save the fitness
				gen.nextGen(myGameManager.tmpFitness, fitnessChart);

				// Reset the value (counting obstacle)
				fitness = 0;
				lastValue = 1000

				// Update the interface
				updateInterface();
			}
		}
	}
}

function getBestNN(){
	var maxFitness = -1;
	var bestNNIndex;

	for (var i = 0; i < gen.genomes.length; i++) {
		if (gen.genomes[i].fitness > maxFitness) {
			maxFitness = gen.genomes[i].fitness;
			bestNNIndex = i;
		}
	}

	printSelectedNeuralNet(bestNNIndex);
}

function printSelectedNeuralNet(nnIndex) {
	var weights = gen.genomes[nnIndex].getWeights();
	$("#textareaExport").html(weights.toString());
}

function resfreshNNselection() {
	$("#neuralNetSelector").empty();
	for (var i = 0; i < gen.genomes.length; i++) {
		$("#neuralNetSelector").append('<option value="'+i+'">Neural net '+(i+1)+'</option>');
	}

	$('select').material_select();
	printSelectedNeuralNet($('#neuralNetSelector').val());
}

// Update the interface
function updateInterface() {
	$('#generationIndex').html(gen.generation + 1);
	$('#genomeIndex').html(gen.currentGenome + 1 + "/" + gen.genomes.length);
}

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
    $('.modal').find('input:text, input:password').val('');
    $('.modal').find('input:radio, input:checkbox').prop('checked', false);
}

// Save the change on the neural network
function saveChange(){
    Materialize.toast('Neural network succesfully modified', 4000)
}

// Import a neural network
function importNeuralNetwork(){
	gen = new Generation(myGameManager.defaultTopology, myGameManager.defaultNumberOfGenomes, activation, selectionMethod, crossoverMethod, mutationMethod);

	var genToImport = JSON.parse("[" + $("#textareaImport").val() + "]");
	var oldGen = gen.genomes[0].getWeights();

	if (genToImport.length != oldGen.length) {
		Materialize.toast('Importation error, missing or too many data (wrong game ?)', 6000)
	}
	else {
		gen.genomes[0].setWeights(genToImport);

	    Materialize.toast('Neural network succesfully imported', 4000)

	    // Reset everything
		fitnessChart.data.datasets[0].data = null;
	    timePassed = 0;
	    $("#timeIndex").html(timePassed);
		updateInterface()
	    gen.drawNeuralNet(c,ctx);
	}
	
	$('#importModal').modal('close');
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