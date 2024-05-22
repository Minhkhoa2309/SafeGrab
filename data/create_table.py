import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float, TIMESTAMP
from sqlalchemy import UniqueConstraint, text

# Load environment variables from .env file
load_dotenv()

# Get database connection information from environment variables
PGHOST = os.getenv("PGHOST")
PGDATABASE = os.getenv("PGDATABASE")
PGUSER = os.getenv("PGUSER")
PGPASSWORD = os.getenv("PGPASSWORD")

# Create SQLAlchemy engine
engine = create_engine(f'postgresql://{PGUSER}:{PGPASSWORD}@{PGHOST}/{PGDATABASE}')

# Create metadata object
metadata = MetaData()

# Define tables
redlight_cam_table = Table(
    'redlight_cam', metadata,
    Column('id', Integer, primary_key=True),
    Column('intersection', String),
    Column('camera_id', String),
    Column('address', String),
    Column('violation_date', TIMESTAMP),
    Column('violations', Integer),
    Column('latitude', Float),
    Column('longitude', Float),
    UniqueConstraint('camera_id', 'violation_date', name='unique_redlight_violation')
)

speed_cam_table = Table(
    'speed_cam', metadata,
    Column('id', Integer, primary_key=True),
    Column('address', String),
    Column('camera_id', String),
    Column('violation_date', TIMESTAMP),
    Column('violations', Integer),
    Column('latitude', Float),
    Column('longitude', Float),
    UniqueConstraint('camera_id', 'violation_date', name='unique_speed_violation')
)

crashes_table = Table(
    'crashes', metadata,
    Column('crash_record_id', String, primary_key=True),
    Column('crash_date', TIMESTAMP),
    Column('device_condition', String),
    Column('weather_condition', String),
    Column('lighting_condition', String),
    Column('roadway_surface_cond', String),
    Column('damage', String),
    Column('first_crash_type', String),
    Column('prim_contributory_cause', String),
    Column('sec_contributory_cause', String),
    Column('street_no', Integer),
    Column('street_direction', String),
    Column('street_name', String),
    Column('injuries_total', Integer),
    Column('latitude', Float),
    Column('longitude', Float)
)

# Create tables
metadata.create_all(engine)

with engine.connect() as connection:
    connection.execute(text("ALTER TABLE crashes ADD COLUMN geom geometry(Point, 4326);"))
    connection.execute(text("UPDATE crashes SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);"))
    connection.execute(text("CREATE INDEX idx_crashes_geom ON crashes USING GIST (geom);"))

print("Tables created successfully!")
