// IMPORTS =====================================================================

var utils = require('./utils');



// GENRERATION =================================================================

var generateBaseTrendLayer = function(inputDataArray) {
  var baseTrendLayer = [];

  for (var dataIndex = 0; dataIndex < inputDataArray.length - 1; dataIndex++) {
    var leftData   = inputDataArray[dataIndex];
    var rightData  = inputDataArray[dataIndex + 1];

    var difference = rightData - leftData;
        difference = utils.clamp(difference);

    baseTrendLayer.push(difference);
  }

  return baseTrendLayer;
}

var BEND = 'b';
var generateTrendLayer = function(priorTrendLayer) {
  var resultingTrendLayer = [];

  for (var dataIndex = 0; dataIndex < priorTrendLayer.length -1; dataIndex++) {
    var leftChild    = priorTrendLayer[dataIndex];
    var rightChild   = priorTrendLayer[dataIndex + 1];

    // BENDs overrule other sign changes.
    if (leftChild === BEND || rightChild === BEND) {
      resultingTrendLayer.push(BEND);
      continue;
    }

    // 0's are the weakest.
    if (leftChild === 0 && rightChild === 0) {
      resultingTrendLayer.push(0);
      continue;
    }

    // Alternations between +'s and -'s are considered BENDs.
    var summation  = rightChild + leftChild;
    if (summation === 0) {
      resultingTrendLayer.push(BEND);
      continue;
    }

    // Otherwise, push the agreeing sign.
    var agreeingSign = utils.clamp(summation);
    resultingTrendLayer.push(agreeingSign);
  }

  return resultingTrendLayer;
}

var recursivelyBuildTrendLayers = function(groupedTrendLayers, depth) {
  // Base case.
  if (depth === 0) {
    return groupedTrendLayers;
  }

  // Action.
  var resultingLayer = generateTrendLayer(groupedTrendLayers[groupedTrendLayers.length - 1]);
  groupedTrendLayers.push(resultingLayer);

  // Recursion.
  return recursivelyBuildTrendLayers(groupedTrendLayers, depth - 1);
}



// SUMMATION ===================================================================

var sumSingleWindow = function(groupedTrendLayer, windowSize, baseIndex) {
  var windowSizeOffset = windowSize - 2;
  var singleWindowSum = 0;

  // First, loop through each requested level.
  for (var level = 0; level < windowSizeOffset; level++) {
    var currentLevel = groupedTrendLayer[windowSizeOffset - level];

    // Add the correct segment in each level.
    for (var index = baseIndex; index <= baseIndex + level; index++) {
      if (currentLevel[index] === BEND) continue;
      singleWindowSum += currentLevel[index];
    }
  }

  return singleWindowSum;
}



// EXPORTS =====================================================================

module.exports = {
  BEND: BEND,

  generateBaseTrendLayer: generateBaseTrendLayer,
  generateTrendLayer: generateTrendLayer,
  recursivelyBuildTrendLayers: recursivelyBuildTrendLayers
}