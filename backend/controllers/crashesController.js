const speedJson = require("../speed.json");
const routeJson = require("../transportation.json");
const axios = require("axios");

async function fetchData(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.log("Error:", error);
    }
}

function sortCrashesToRoute(routes, coordinate) {
    let conditionFound = false;
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        // console.log(route)
        const points = route.points
        // console.log(points.length)
        for (let j = 0; j < points.length - 1; j++) {
            const pointA = points[j]
            const pointB = points[j + 1]
            const minX = Math.min(pointA[0], pointB[0]);
            const maxX = Math.max(pointA[0], pointB[0]);
            const minY = Math.min(pointA[1], pointB[1]);
            const maxY = Math.max(pointA[1], pointB[1]);

            if (
                coordinate[0] >= minX &&
                coordinate[0] <= maxX &&
                coordinate[1] >= minY &&
                coordinate[1] <= maxY
            ) {
                route.count += 1;
                conditionFound = true;
                break;
            }
        }
        if (conditionFound) {
            break;
        }
    }
    // if (!conditionFound) {
    //     notMentionedCrashes.count += 1
    // }
}

function getCoordinates(inputString) {
    const coordinateRegex = /-?\d+\.\d+/g;
    const coordinates = inputString.match(coordinateRegex);
    const coordinatePairs = [];
    for (let i = 0; i < coordinates.length; i += 2) {
        coordinatePairs.push([Number(coordinates[i]), Number(coordinates[i + 1])]);
    }
    return coordinatePairs
}

async function getCrashesCluster(req, res) {
    let routes = routeJson.map((route) => {
        let points = null;
        let position = null;
        if (route.the_geom == "MULTILINESTRING EMPTY") {
            points = []
            position = []
        }
        else {
            points = getCoordinates(route.the_geom);
            position = points[1];
        }
        return {
            name: route.STREET_NAM,
            type: route.STREET_TYP,
            points: points,
            position: position,
            count: 0,
        };
    });
    // sortCrashesToRoute(routes, [12.1234325, 12.564353])

    let limit = 300000;
    let offset = 0;
    // let notMentionedCrashes = { count: 0 };
    // let totalLength = 0;
    while (true) {
        const url = "https://data.cityofchicago.org/resource/85ca-t3if.json?$limit=" + limit + "&$offset=" + offset;
        const crashesJson = await fetchData(url);
        if (crashesJson.length == 0) {
            break;
        }
        // for (let i = 0; i < crashesJson.length; i++) {
        //     const crash = crashesJson[i]
        //     if (crash.longitude == "" || crash.latitude == "") {
        //         continue;
        //     }
        //     const coordinate = [Number(crash.longitude), Number(crash.latitude)];
        //     sortCrashes(routes, coordinate, notMentionedCrashes);
        // }
        crashesJson
            // .filter((crash) => crash.longitude != "" && crash.latitude != "")
            .forEach((crash) => {
                const coordinate = [Number(crash.longitude), Number(crash.latitude)];
                sortCrashesToRoute(routes, coordinate);
            });
        offset += limit;
        // totalLength += crashesJson.length
    }
    // console.log(notMentionedCrashes.count)
    // console.log(totalLength)
    res.status(200).json({ routes });
    // res.status(200).send('OK')
}

module.exports = {
    getCrashesCluster,
};

// const points = [
//     [-87.624241, 41.896835],
//     [-87.617048, 41.896936],
// ];
// const points = congestionJson
//     .filter(
//         (segment) =>
//             segment.START_LONGITUDE !== "" &&
//             segment.START_LATITUDE !== "" &&
//             segment.END_LONGITUDE !== "" &&
//             segment.END_LATITUDE
//     )
//     .flatMap((segment) => [
//         [Number(segment.START_LONGITUDE), Number(segment.START_LATITUDE)],
//         [Number(segment.END_LONGITUDE), Number(segment.END_LATITUDE)],
//     ]);

// function isInPath(points, coordinate) {
// for (i = 0; i < points.length; i++) {
//     const minX = Math.min(points[i][0], points[i + 1][0]);
//     const maxX = Math.max(points[i][0], points[i + 1][0]);
//     const minY = Math.min(points[i][1], points[i + 1][1]);
//     const maxY = Math.max(points[i][1], points[i + 1][1]);
//     if (
//         coordinate[0] >= minX &&
//         coordinate[0] <= maxX &&
//         coordinate[1] >= minY &&
//         coordinate[1] <= maxY
//     ) {
//         return true;
//     }
//     i++;
// }
// return false;
// }

// const coordinates = speedJson
//     .filter(
//         (violation) =>
//             violation.LONGITUDE !== "" && violation.LATITUDE !== ""
//     )
//     .map((violation) => {
//         return [Number(violation.LONGITUDE), Number(violation.LATITUDE)];
//     });

// let count = 0;
// coordinates.forEach((coordinate) => {
//     if (isInPath(points, coordinate)) {
//         count += 1;
//     }
// });
