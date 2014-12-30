// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

// Front-end to execute the tests. This should be the only javascript
// file with spidermonkey built-in functions and globals

load("../animah-js/math.js");
load("../animah-js/misc.js");
load("../animah-js/player.js");
load("tests.js");

var NUM_TESTS = 3;

var numTest;
var numSamples;
var outCome = "";

print("Anima Helper tests. Right now we manage the 3 following tests:");
print("\tTest1: Checks the distribution of AnimahMath.getRandomInt (1,100)");
print("\tTest2: Compute stats (average, std deviation, etc) for the three "+
      "different dice rolls on anima");
print("\tTest3: compute the average on the sum of the stats going through "+
      "the traditional stats-by-dice getter")
print("Usage: js24 tests.js numTest numSamples");

if (scriptArgs.length != 2) {
    print("ERROR: Wrong number of parameters");
    quit();
}

numTest = Number(scriptArgs[0]);
if (isNaN(numTest)) {
    print("ERROR: numTest should be a number");
    quit();
}

numSamples = Number(scriptArgs[1]);
if (isNaN(numSamples) || numSamples < 0) {
    print("ERROR: numSamples should be a number greater than 0");
    quit();
}

switch(numTest) {
    case 0:
    outCome = test1(numSamples);
    break;
    case 1:
    outCome = test2(numSamples);
    break;
    case 2:
    outCome = test3(numSamples);
    break;
    default:
    print("ERROR: numTest should be a number between 0 and "+(NUM_TESTS-1));
    break;
}

print("SUCCESS: Test "+numTest+":");
print(outCome);
