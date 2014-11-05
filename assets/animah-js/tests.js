// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
/**
 * I'm not are not using qunit or something like that because for
 * current tests, I'm more interested execute a test, and see the
 * information logged. In the same way, each test can be time
 * consuming, so I want to run each one individually. After all a lot
 * of the stuff to test is using random values. In some sense, the
 * problem is that current tests are not unit-tests, but functional
 * ones. In the future I can add unit tests with qunit.
 *
 * I'm also using mobile-ui to maintain a visual coherence, as after
 * all it is eye-candy ;)
*/

//Aux log methods
var textLog = "";

function clearLog() {
    textLog = "";
}

function log(newLine) {
    textLog = textLog + newLine + "\n";
}

function getLog() {
    return textLog;
}

//Tests

//********************************************************************************
/**
 * test1: Checks the distribution of AnimahMath.getRandomInt (1,100)
 */
function test1(numSamples) {
    var finalValue;
    var i = 0;
    var error = 0;
    var finalTable = [];

    myMath = new AnimahMath();

    for (i = 0; i < 100; i++)
        finalTable[i] = 0;

    for (i = 0; i < numSamples; i++) {
        finalValue = myMath.getRandomInt(1, 100);

      if ((finalValue < 1) || (finalValue > 100)) {
          log("Error: value = %i", finalValue);
          error ++;
      } else {
        finalTable[finalValue - 1]++;
      }
    }

    log ("NUMBER OF SAMPLES: " + numSamples);
    log ("NUMBER OF ERRORS " + error + ", " + 100*error / numSamples);
    log ("FINAL TABLE");
    for (i = 0; i < 25; i ++ ) {
        var line = "";
        for (c = 0; c < 4; c++)
            line = line + "\t" + (i + c*25 + 1) + "=" + 100*finalTable[i+c*25]/numSamples;

        log(line);
    }

  return true;
}

// mimic test1 on old anima helper
function onTest1() {
    clearLog();

    test1(100000);

    $('#test-output').text(getLog());
}

//********************************************************************************
function testGetDiceRoll(type, numSamples) {
    var total = 0;
    var maxValue = 0;
    var minValue = 100;
    var samples = new Array();
    var numOpened = [0,0,0,0,0,0,0,0,0,0];
    var averageOpened = new Array();
    var average = 0;
    var moreThanAverage = 0;
    var maxValueOpened = 0;
    var variance = 0;
    var diceRoll = 0;

    myMath = new AnimahMath();

    for (i = 0; i < numSamples; i++) {
        diceRoll = myMath.getDiceRoll(type);

        if (diceRoll[0] > maxValue) {
            maxValue = diceRoll[0];
            maxValueOpened = diceRoll[1];
        }
        if (diceRoll[0] < minValue)
            minValue = diceRoll[0];
        samples[i] = diceRoll[0];

        for (c = 0; c < 10; c++)
            if (diceRoll[1] > c)
                numOpened[c]++;

        total += diceRoll[0];
    }

    average = total / numSamples;
    for (c = 0; c < 10; c++)
        averageOpened[c] = (numOpened[c]*100) / numSamples;

    /* we use this average to compute the variance and std variance */
    total = 0;
    for (i = 0; i < numSamples; i++)  {
        total += (samples[i] - average) * (samples[i] - average);
        if (samples[i] > average)
            moreThanAverage++;
    }
    variance = total / numSamples;
    moreThanAverage = (moreThanAverage * 100) / numSamples;

    log("AVERAGE: " + average);
    log("VARIANCE: " + variance);
    log("STD VARIANCE: " + Math.sqrt(variance));
    log("MINIMUM VALUE: " +  minValue);
    log("MAXIMUM VALUE: " + maxValue + "(" + maxValueOpened + ")");
    c = 0;
    while (numOpened[c] > 0) {
        log (" %% OPENED MORE THAT "+c+": "+averageOpened[c]);
        c++;
    }
    log("%% GREATER THAN AVERAGE: "+moreThanAverage);
}

function test2(numSamples) {
    log("NUM SAMPLES = " + numSamples);
    log("****************************************");
    log("ANIMA DATA FOR NORMAL");
    testGetDiceRoll (AnimahRollType.NORMAL, numSamples);
    log("****************************************");
    log("ANIMA DATA FOR INITIATIVE");
    testGetDiceRoll (AnimahRollType.INITIATIVE, numSamples);
    log("****************************************");
    log("ANIMA DATA FOR RESISTANCE");
    testGetDiceRoll (AnimahRollType.RESISTANCE, numSamples);
}

// mimic test2 on old anima helper
function onTest2() {
    clearLog();

    test2(100000);

    $('#test-output').text(getLog());
}

//********************************************************************************
// Test3: compute the average on the sum of the stats going through the traditional
//    stats-by-dice getter

function cleanPlayer(player) {
    for (i = 0; i < 8; i++)
        player[i] = 1;
}

function printPlayer(player) {
    line = "Player stats=("
    for (i = 0; i < 7; i++)
        line += player[i]+",";
    line += player[i] + ")";

    return line;
}

function sumPlayer(player) {
    var sum = 0;

    for (i = 0; i < 8; i++)
        sum += player[i];

    return sum;
}

//Extended in sense that counts each 10 as special, adding 11 instead of 10
function sumPlayerExtended(player) {
    var sum = 0;

    for (i = 0; i < 8; i++) {
        sum += player[i];
        if (player[i] == 10)
            sum++;
    }

    return sum;
}

function compareNumbers (a, b) {
    return a - b;
}

function test3(numSamples) {
    var currentPlayer = [1,1,1,1,1,1,1,1];
    var worsePlayer = [10, 10, 10, 10, 10, 10, 10, 10, 10];
    var worsePlayerSum = 100;
    var bestPlayer = [1,1,1,1,1,1,1,1];;
    var bestPlayerSum = 0;
    var currentSum = 0;
    var currentExtendedSum = 0;
    var worseStat = 10;
    var worseStatReplacementNotNeeded = 0;
    var totalSum = 0;
    var totalSumExtended = 0;
    var samples = new Array();
    var samplesExtended = new Array();

    myMath = new AnimahMath();

    for(sample = 0; sample < numSamples; sample++) {
        cleanPlayer(currentPlayer);
        for (c = 0; c < 8; c++) {
            do
                currentPlayer[c] = myMath.getRandomInt(1,10);
            while (currentPlayer[c] < 4);
        }

        //replace worse stat with a 9
        currentPlayer.sort(compareNumbers);
        if (currentPlayer[0] < 9)
            currentPlayer[0] = 9;
        else
            worseStatReplacementNotNeeded += 1;

        currentSum = sumPlayer(currentPlayer);
        currentExtendedSum = sumPlayerExtended(currentPlayer);

        if (worsePlayerSum > currentSum) {
            worsePlayer = currentPlayer.slice(0);
            worsePlayerSum = currentSum;
        }

        if (bestPlayerSum < currentSum) {
            bestPlayer = currentPlayer.slice(0);
            bestPlayerSum = currentSum;
        }

        samples[sample] = currentSum;
        samplesExtended[sample] = currentExtendedSum;
        totalSum += currentSum;
        totalSumExtended += currentExtendedSum;
    }

    average = totalSum/numSamples;
    averageExtended = totalSumExtended/numSamples;

    totalSum = 0;
    totalSumExtended = 0;
    for (sample = 0; sample < numSamples; sample++) {
        totalSum += (samples[sample] - average) * (samples[sample] - average);
        totalSumExtended += (samplesExtended[sample] - averageExtended) * (samplesExtended[sample] - averageExtended);
    }
    variance = totalSum/numSamples;
    varianceExtended = totalSumExtended/numSamples;

    worsePlayer.sort(compareNumbers);
    bestPlayer.sort(compareNumbers);
    log("NUM SAMPLES = " + numSamples);
    log("Average sum: " + average + "  Average sum (10 extra cost): " + averageExtended);
    log("Worse player: " + printPlayer(worsePlayer));
    log("\tsumPlayer=" + sumPlayer(worsePlayer) + "  sumPlayer 10 extra cost=" + sumPlayerExtended(worsePlayer));
    log("Best player: " + printPlayer(bestPlayer));
    log("\tsumPlayer=" + sumPlayer(bestPlayer) + "  sumPlayer 10 extra cost=" + sumPlayerExtended(bestPlayer));
    log("Times was not needed to replace worse stat with a 9: " + worseStatReplacementNotNeeded);
    log("Variance: " + variance + " Variance (10 extra cost): " + varianceExtended);
    log("Std Variance: " + Math.sqrt(variance) + " Std Variance (10 extra cost): " + Math.sqrt(varianceExtended));
}


function onTest3() {
    clearLog();

    test3(10000);

    $('#test-output').text(getLog());
}



