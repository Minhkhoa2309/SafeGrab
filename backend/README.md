# BACKEND VERSION 1.1
## Functions
- Add API paths to pull summarized data + map modelling for:
  - Speed violations
  - Red lights violations
  - Crashes

## Usage
Download all npm package dependencies
```
npm i
```
Create a .env file and add the following information in this format
```
POSTGRES_HOST=<HOST-IP>
POSTGRES_PORT=<PORT-NUMBER>
POSTGRES_USERNAME=<USERNAME>
POSTGRES_PASSWORD=<PASSWORD>
POSTGRES_DATABASE=<DATABASE-NAME>
```
Run the code
```
npm start
```
## API Routes
The base API route is /api/v1
- /redlights/map: GET GeoJSON of number of redlight violations based on grid size and bounding box. Request query includes:
  - gridSize: divide the bounding box into determined grid size
  - boundingBox: an array with 4 arrays holding 4 points for the bounding box
  - startDate: filter date of violation
  - endDate: filter date of violation
- /speeds/map: same as above
- /crashes/map: same as above
- /redlights/table: GET JSON of information in redlight violations. Request query includes
  - intersection: filter by intersection
  - startDate: filter date of violation
  - endDate: filter date of violation
  - pageSize: size of each page for pagination
  - pageIndex: current page
- /speeds/table: GET JSON of information in speed violations. Request query includes
  - Same as /redlights/table but without the intersection field
- /crashes/table: GET JSON of information in crashes. Request query includes
  - Same as /redlights/table but change the intersection field to 'streetName' field to filter street name

## Future Plans
- Code refactoring
- Error handling
- Authentication
- Show danger zones / warning points when user query desired traffic routes using two coordinates --> get desired path to user

## Credits
- All datasets taken from [City of Chicago's open data portal](https://data.cityofchicago.org/).