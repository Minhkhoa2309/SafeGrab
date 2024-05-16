from dataclasses import dataclass, asdict
from typing import Optional
from datetime import datetime

@dataclass
class KafkaCrashesRecord:
    crash_record_id: str
    crash_date: datetime
    device_condition : Optional[str] = None
    weather_condition: Optional[str] = None
    lighting_condition: Optional[str] = None
    roadway_surface_cond: Optional[str] = None
    damage: Optional[str] = None
    first_crash_type: Optional[str] = None
    prim_contributory_cause: Optional[str] = None
    sec_contributory_cause: Optional[str] = None
    street_no: Optional[int] = None
    street_direction: Optional[str] = None
    street_name: Optional[str] = None
    injuries_total: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    def to_dict(self) -> dict:
        data = asdict(self)
        data['crash_date'] = self.crash_date.isoformat()
        return data

    def __init__(self, data: dict):
        self.crash_record_id = data.get('crash_record_id')
        self.crash_date = datetime.fromisoformat(data.get('crash_date')) 
        self.device_condition = data.get('device_condition')
        self.weather_condition = data.get('weather_condition')
        self.lighting_condition = data.get('lighting_condition')
        self.roadway_surface_cond = data.get('roadway_surface_cond')
        self.damage = data.get('damage')
        self.first_crash_type = data.get('first_crash_type')
        self.prim_contributory_cause = data.get('prim_contributory_cause')
        self.sec_contributory_cause = data.get('sec_contributory_cause')
        self.street_no = data.get('street_no')
        self.street_direction = data.get('street_direction')
        self.street_name = data.get('street_name')
        self.injuries_total = data.get('injuries_total')
        self.latitude = data.get('latitude')
        self.longitude = data.get('longitude')