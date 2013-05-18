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
function testGetDiceRoll(type, numSamples) {
    var total = 0;
    var maxValue = 0;
    var minValue = 100;
    var samples = new Array();
    var numOpened = [0,0,0,0,0,0,0,0,0,0];
    var averageOpened = new Array();
    var average = 0;
    var moreThanAverage = 0;
    var maxValeOpened = 0;
    var variance = 0;
    var diceRoll = 0;

    myMath = new AnimahMath();

    for (i = 0; i < numSamples; i++) {
        diceRoll = myMath.getDiceRoll(type);

        if (diceRoll[0] > maxValue) {
            maxValue = diceRoll[0];
            maxValeOpened = diceRoll[1];
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
    log("MAXIMUM VALUE: " + maxValue + "(" + maxValeOpened + ")");
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
