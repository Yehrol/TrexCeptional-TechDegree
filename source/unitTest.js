//
QUnit.test('Generation constructor', function (assert) {
   assert.expect(6);

   var topology = [2,2,1];
   var numberOfGenomes = 12;
   var activation = new sigmoid();
   var selectionMethod = new rouletteWheelSelection();
   var crossoverMethod = new singlePointCrossover();
   var mutationMethod = new mutationWithRate(0.2);

   var generation = new Generation(topology, numberOfGenomes, activation, selectionMethod, crossoverMethod, mutationMethod);

   assert.deepEqual(generation.topology, topology, undefined);
   assert.equal(generation.numberOfGenomes, numberOfGenomes, undefined);
   assert.equal(generation.activationFunction, activation, undefined);
   assert.equal(generation.selection, selectionMethod, undefined);
   assert.equal(generation.crossover, crossoverMethod, undefined);
   assert.equal(generation.mutation, mutationMethod, undefined);
});

//
QUnit.test('Generation run', function (assert) {
   assert.expect(1);

   var topology = [2,2,1];
   var numberOfGenomes = 12;
   var activation = new sigmoid();
   var selectionMethod = new rouletteWheelSelection();
   var crossoverMethod = new singlePointCrossover();
   var mutationMethod = new mutationWithRate(0.2);

   var input = [1,1];

   var generation = new Generation(topology, numberOfGenomes, activation, selectionMethod, crossoverMethod, mutationMethod);

   assert.equal(typeof generation.run(input), "number", undefined);
});

//
QUnit.test('Generation getFitnessAverage', function (assert) {
   assert.expect(1);

   var topology = [2,2,1];
   var numberOfGenomes = 12;
   var activation = new sigmoid();
   var selectionMethod = new rouletteWheelSelection();
   var crossoverMethod = new singlePointCrossover();
   var mutationMethod = new mutationWithRate(0.2);

   var generation = new Generation(topology, numberOfGenomes, activation, selectionMethod, crossoverMethod, mutationMethod);

   assert.equal(typeof generation.getFitnessAverage(), "number", undefined);
});

//
QUnit.test('Generation getBestFitness', function (assert) {
   assert.expect(1);

   var topology = [2,2,1];
   var numberOfGenomes = 12;
   var activation = new sigmoid();
   var selectionMethod = new rouletteWheelSelection();
   var crossoverMethod = new singlePointCrossover();
   var mutationMethod = new mutationWithRate(0.2);

   var generation = new Generation(topology, numberOfGenomes, activation, selectionMethod, crossoverMethod, mutationMethod);

   assert.equal(typeof generation.getBestFitness(), "number", undefined);
});

//
QUnit.test('Genome constructor', function (assert) {
   assert.expect(1);

   var topology = [2,2,1];
   var activation = new sigmoid();

   var genome = new Genome(topology, activation);

   assert.notEqual(genome.neuralNet, null, undefined);
});

//
QUnit.test('Genome setFitness', function (assert) {
   assert.expect(1);

   var topology = [2,2,1];
   var activation = new sigmoid();

   var genome = new Genome(topology, activation);
   
   genome.setFitness(1)
   assert.equal(genome.fitness, 1, undefined);
});

//
QUnit.test('Genome getWeights', function (assert) {
   assert.expect(1);

   var topology = [2,2,1];
   var activation = new sigmoid();

   var genome = new Genome(topology, activation);
   
   assert.equal(typeof genome.getWeights(), "object", undefined);
});

//
QUnit.test('Genome setWeights', function (assert) {
   assert.expect(1);

   var topology = [1,1,1];
   var activation = new sigmoid();

   var genome = new Genome(topology, activation);
   var weights = [1,2,3,4];
   genome.setWeights(weights);
   
   assert.deepEqual(genome.getWeights(), weights, undefined);
});

//
QUnit.test('Genome getOutput', function (assert) {
   assert.expect(1);

   var topology = [1,1,1];
   var activation = new sigmoid();

   var genome = new Genome(topology, activation);
   
   assert.equal(typeof genome.getOutput(), "number", undefined);
});

//
QUnit.test('NeuralNetwork constructor', function (assert) {
   assert.expect(2);

   var topology = [1,1,1];
   var activation = new sigmoid();

   var neuralNetwork = new NeuralNetwork(topology, activation);

   assert.equal(neuralNetwork.numberOfLayers, topology.length, undefined);
   assert.equal(neuralNetwork.layers.length, topology.length, undefined);
});

//
QUnit.test('NeuralNetwork getWeights', function (assert) {
   assert.expect(1);

   var topology = [1,1,1];
   var activation = new sigmoid();

   var neuralNetwork = new NeuralNetwork(topology, activation);
   
   assert.equal(typeof neuralNetwork.getWeights(), "object", undefined);
});

//
QUnit.test('NeuralNetwork setWeights', function (assert) {
   assert.expect(1);

   var topology = [1,1,1];
   var activation = new sigmoid();

   var neuralNetwork = new NeuralNetwork(topology, activation);
   
   var weights = [1,2,3,4];
   neuralNetwork.setWeights(weights);
   
   assert.deepEqual(neuralNetwork.getWeights(), weights, undefined);
});

//
QUnit.test('NeuralNetwork getOutput', function (assert) {
   assert.expect(1);

   var topology = [1,1,1];
   var activation = new sigmoid();

   var neuralNetwork = new NeuralNetwork(topology, activation);
   
   assert.equal(typeof neuralNetwork.getOutput(), "number", undefined);
});

//
QUnit.test('Layer constructor', function (assert) {
   assert.expect(1);

   var numberOfNeurons = 1;
   var numberOfOutputs = 2;
   var activation = new sigmoid();

   var layer = new Layer(numberOfNeurons, numberOfOutputs, activation);
   
   assert.equal(layer.neurons.length, numberOfOutputs, undefined);
});

//
QUnit.test('Layer getWeights', function (assert) {
   assert.expect(1);

   var numberOfNeurons = 1;
   var numberOfOutputs = 2;
   var activation = new sigmoid();

   var layer = new Layer(numberOfNeurons, numberOfOutputs, activation);

   var weights = [1,2,3,4];
   layer.setWeights(weights, 2);
   
   assert.deepEqual(layer.getWeights(), weights, undefined);
});

//
QUnit.test('Layer setWeights', function (assert) {
   assert.expect(1);

   var numberOfNeurons = 1;
   var numberOfOutputs = 2;
   var activation = new sigmoid();

   var layer = new Layer(numberOfNeurons, numberOfOutputs, activation);

   var weights = [1,2,3,4];
   layer.setWeights(weights, 2);
   
   assert.deepEqual(layer.getWeights(), weights, undefined);
});

//
QUnit.test('Neuron constructor', function (assert) {
   assert.expect(4);

   var numberOfOutputs = 2;
   var index = 1;
   var activation = new sigmoid();

   var neuron = new Neuron(numberOfOutputs, index, activation);
   
   assert.equal(neuron.numberOfOutputs, numberOfOutputs, undefined);
   assert.equal(neuron.index, index, undefined);
   assert.equal(neuron.activationFunction, activation, undefined);
   assert.equal(neuron.outputWeights.length, numberOfOutputs, undefined);
});

//
QUnit.test('Neuron getWeights', function (assert) {
   assert.expect(1);

   var numberOfOutputs = 2;
   var index = 1;
   var activation = new sigmoid();

   var neuron = new Neuron(numberOfOutputs, index, activation);

   var weights = [1,2];
   neuron.setWeights(weights);
   
   assert.deepEqual(neuron.getWeights(), weights, undefined);
});

//
QUnit.test('Neuron setWeights', function (assert) {
   assert.expect(1);

   var numberOfOutputs = 2;
   var index = 1;
   var activation = new sigmoid();

   var neuron = new Neuron(numberOfOutputs, index, activation);

   var weights = [1,2];
   neuron.setWeights(weights);
   
   assert.deepEqual(neuron.getWeights(), weights, undefined);
});

//
QUnit.test('Connection constructor', function (assert) {
   assert.expect(1);

   var connection = new Connection();
   
   assert.equal(typeof connection.weight, "number", undefined);
});

//
QUnit.test('Connection getWeight', function (assert) {
   assert.expect(1);

   var number = 2;
   var connection = new Connection();
   connection.setWeight(number);
   
   assert.equal(connection.getWeight(), number, undefined);
});

//
QUnit.test('Connection setWeight', function (assert) {
   assert.expect(1);

   var number = 2;
   var connection = new Connection();
   connection.setWeight(number);
   
   assert.equal(connection.getWeight(), number, undefined);
});

//
QUnit.test('Connection randomWeight', function (assert) {
   assert.expect(1);

   var connection = new Connection();
   
   assert.equal(typeof connection.getWeight(), "number", undefined);
});

//
QUnit.test('rouletteWheelSelection process', function (assert) {
   assert.equal(true,true, undefined);
});

//
QUnit.test('singlePointCrossover process', function (assert) {
   assert.equal(true,true, undefined);
});

//
QUnit.test('mutationWithoutRate process', function (assert) {
   assert.equal(true,true, undefined);
});

//
QUnit.test('mutationWithRate process', function (assert) {
   assert.equal(true,true, undefined);
});

//
QUnit.test('sigmoid normal', function (assert) {
   assert.expect(1);

   var sig = new sigmoid();
   
   assert.equal(sig.normal(1), 0.7310585786300049, undefined);
});

//
QUnit.test('sigmoid derivative', function (assert) {
   assert.expect(1);

   var sig = new sigmoid();
   
   assert.equal(sig.derivative(1), 0.5859934626301939, undefined);
});

//
QUnit.test('tanh normal', function (assert) {
   assert.expect(1);

   var tan = new tanh();
   
   assert.equal(tan.normal(1), 0.7615941559557649, undefined);
});

//
QUnit.test('tanh derivative', function (assert) {
   assert.expect(1);

   var tan = new tanh();
   
   assert.equal(tan.derivative(1), 0, undefined);
});