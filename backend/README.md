# BACKEND VERSION 1.0
## Functions
- Add API paths to pull summarized data for:
  - Congestions
  - Speed violations
  - Red lights violations

## Usage
Download all npm package dependencies
```
npm i
```
Download all CSV files from the links below and put them all into "data" folder
- [Red Light Camera Violations](https://data.cityofchicago.org/Transportation/Red-Light-Camera-Violations/spqx-js37/about_data)
- [Speed Camera Violations](https://data.cityofchicago.org/Transportation/Speed-Camera-Violations/hhkd-xvj4/about_data)
- [Current Traffic Congestion Estimate](https://data.cityofchicago.org/Transportation/Chicago-Traffic-Tracker-Congestion-Estimates-by-Se/n4j6-wkkf/about_data)
- [Chicago Street Center Lines](https://data.cityofchicago.org/Transportation/Street-Center-Lines/6imu-meau)

Change file name in convert.js (for array "inputs" and "outputs")
After that, run
```
npm run convert
```
This should give you all the json files needed to run this

All that left is
```
npm run dev
```
## API Routes
The base API route is /api/v1
- /redlights/cluster: get GeoJSON of number of redlight violations on every location recorded
- /speeds/cluster: get GeoJSON of number of speed violations on every location recorded
- /crashes/cluster: get GeoJSON of number of crashes on every road (WORK IN PROGRESS)
- /congestions/cluster: get GeoJSON of congestions on every road (MAY REMOVED SOON)

## Future Plans
- Change the way to get /crashes/cluster. Here are my proposals
  - Pre-computed tables using the current algorithm
  - Sort by month + year --> get all the points without combining data
  - Use radius / hexagon layer (not in favor)
- Error handling
- Authentication
- Show danger zones / warning points when user query desired traffic routes using two coordinates --> get desired path to user
- Crash prediction???

## Credits
- All datasets taken from [City of Chicago's open data portal](https://data.cityofchicago.org/).