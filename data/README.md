# Automated Data Crawling
This tool automatically collects data from the City of Chicago's open data portal, sends it to Kafka for further processing

# Data Sources
All datasets are taken from the City of Chicago's open data portal:
Traffic Crashes: This dataset shows each crash that occurred within city streets as reported in the electronic crash reporting system (E-Crash) at CPD. Citywide data are available starting September 2017.
Red Light Camera Violations: This dataset reflects the daily number of red light camera violations recorded by the City of Chicago Red Light Program for each camera since 2014.
Speed Camera Violations: This dataset reflects the daily number of speed camera violations recorded by each camera in Children's Safety Zones since 2014.

# Usage Guide
## 1. Installation
- Ensure you have Python 3.x installed.
- Install the required libraries:

```bash
pip install -r requirements.txt
```

## 2. Configuration
Create a .env file as .env.example and update the following environment variables:
--PostgreSQL Database Credentials
PGHOST=
PGDATABASE=
PGUSER=
PGPASSWORD=

## 3.Running the Tool
### 1.Create Database Tables:
- If the database tables haven't been initialized, run the following command to create them:
```bash
python create_table.py
```
### 2.Start the Data Crawler:
- To start the automated data crawler, run:
```bash
python scheduler.py 
```
By default, the tool will run every day at 10:00 am.

### 3.Customize the Schedule (Optional):
You can adjust the scheduled run time using the --hour and --minute arguments. For example, to run the tool daily at 9:30 am:
example:
```bash
python scheduler.py --hour 9 --minute 30
```

# Important Note
This tool only crawls data from the Chicago Data Portal API and publishes it to Kafka. It does not push the data directly into a database.
You can use tools like Apache Nifi or write your own custom code to consume the data from the Kafka topic and load it into your desired database.