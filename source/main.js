/***********************************************************
* Author : De Biasi Loris
* Description : 
* Version : 0.1
* Date : 24.04.2017
***********************************************************/

// Set the state of the AI
var isRunning = false;
var runner;

var gen;
var numberOfGenomes = 4; //Genomes per generation [minimum 4]
var mutationRate = 0.2;
var topology

var FPS = 60;

// Var to calculate fitness
var nbOfObstacle = 0;
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
            //alert("Ready");
            //console.log(modal, trigger);
        },
        complete: function() { // Callback for Modal close
            //Clear the modals on close
            clearModals();
        }
    });

    // Event when a file is loaded
    document.getElementById('selectedFile').addEventListener('change', readSingleFile, false);

    // Instanciate the game
    runner = new Runner('.interstitial-wrapper');

    // Get the max values
    maxVelocity = runner.config.MAX_SPEED;
	maxDistance = 600 + 25;
	maxYPosition = 105;
	maxSize = runner.config.MAX_OBSTACLE_LENGTH;

    // Main code
    //topology = [4,3,1];
    topology = [1,2,1];
    gen = new Generation(topology, numberOfGenomes, new sigmoid(), mutationRate);

	// Update the interface
	$('#generationIndex').html(gen.generation + 1);
	$('#genomeIndex').html(gen.currentGenome + 1 + "/" + numberOfGenomes);
	$("#decision").html(0);
    
    //
	setInterval(function(){
		// Start when the first obstacle appear
		if (typeof runner.horizon.obstacles[0] != "undefined") {
		    startIA(parseFloat(runner.currentSpeed.toFixed(3)), parseFloat(runner.horizon.obstacles[0].xPos), parseFloat(runner.horizon.obstacles[0].yPos), parseFloat(runner.horizon.obstacles[0].size));
		}


	}, 1000 / FPS);

	// Configuration of the chart
    var data = {
	    datasets: [
	        {
	            label: "Average fitness",
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
	            text: 'Average fitness over generations' // Title
	        },
			/*scales: {
				xAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'Generation'
					}
				}]
			}*/
	    }
	});

    // Call "resizeNeuralNetCanvas" when the window has been resized
    window.addEventListener('resize', resizeNeuralNetCanvas, false);

    // Resize the canvas depending the container size
    resizeNeuralNetCanvas();
});

//
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
	chart.data.labels[chartLength] = "Generation " + (chartLength + 1);
	chart.update();
}

// Change the state of the AI
function changeRunningState() {
	// Change the state
	isRunning = !isRunning;

	// Show if the AI is started or stopped
	if (isRunning == true) {
		// Simulate key press to start the game
		simulateKeyPress(38, "keydown");

		$("#stateBtn").html('STOP<i class="material-icons right">power_settings_new</i>');
		Materialize.toast('AI Started', 4000);
	}
	else{
		runner.stop()// doesnt work [WIP]

		$("#stateBtn").html('START<i class="material-icons right">power_settings_new</i>');
		Materialize.toast('AI Stopped', 4000);
	}
}

var test = 0;
var timePassed = 0;

// 
function startIA(pVelocity,pDistance,pYPosition,pSize) {
    // Show some value for debuging
    $('#Velocity').html(pVelocity);
    $('#Distance').html(pDistance);
    $('#yPosition').html(pYPosition);
    $('#Size').html(pSize);

	// Check if the AI should "work"
	if (isRunning == true) {

		gen.drawNeuralNet(c,ctx);

		// timer
		test++;
		if (test >= FPS) {
			timePassed++;
			$("#timeIndex").html(timePassed);
			test = 0;
		}

		// Run the generation
		gen.run(pVelocity, pDistance, pYPosition, pSize);

		// Get the number of obstacle passed
		if (pDistance > lastValue) {
			nbOfObstacle++;
		}
		lastValue = pDistance;

		// When the AI die
		if (runner.crashed) {
			var fitness = nbOfObstacle;//runner.distanceRan.toFixed(0)

			// Restart the game
			restartGame();

			//$("#neuralNetPreview").html("");

			// Check if the game has restarted before changing generation
			if (!runner.crashed) {
				// Change the generation and save the fitness
				gen.nextGen(fitness, fitnessChart);

				// Reset the value (counting obstacle)
				nbOfObstacle = 0;
				lastValue = 1000

				// Update the interface
				$('#generationIndex').html(gen.generation + 1);
				$('#genomeIndex').html(gen.currentGenome + 1 + "/" + numberOfGenomes);
				$("#decision").html(0);
			}
		}
	}
}

//
function restartGame() {
	simulateKeyPress(38, "keyup");
	ctx.clearRect(0,0,c.width,c.height);
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