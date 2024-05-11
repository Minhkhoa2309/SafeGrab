const csvtojson = require("csvtojson");
const fs = require("fs");

const PATH = "./data/";
const inputs = ['Traffic_Crashes_-_Crashes_20240502.csv'];
const outputs = ['crashes.json'];

inputs.forEach((input, index) => {
    const output = outputs[index];
    csvtojson()
        .fromFile(PATH + input)
        .then((jsonObj) => {
            const jsonString = JSON.stringify(jsonObj, null, 2);
            fs.writeFileSync(PATH + output, jsonString);
            console.log('Conversion complete!');
        })
        .catch((err) => {
            console.error('Error:', err);
        });
});

// 'Traffic_Crashes_-_Crashes_20240502.csv'
// './crashes.json'
// 'Speed_Camera_Violations_20240502.csv', 'Red_Light_Camera_Violations_20240502.csv', 'Chicago_Traffic_Tracker_-_Congestion_Estimates_by_Segments_20240502.csv'
// './speed.json', './redlight.json', './congestion.json'
// transportation_20240510.csv
// ./transportation.json