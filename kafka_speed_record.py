from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Optional

@dataclass
class KafkaSpeedCamRecord: 
    camera_id: str = ""
    address: str = ""
    violation_date: datetime = datetime.min
    violations: int = 0
    latitude: float = 0.0
    longitude: float = 0.0

    def to_dict(self) -> dict:
        data = asdict(self)
        data['violation_date'] = self.violation_date.isoformat()
        return data

    def __init__(self, data: dict):
        self.camera_id = data.get('camera_id', "")
        self.address = data.get('address', "")
        self.violation_date = datetime.fromisoformat(data.get('violation_date', datetime.min.isoformat())) 
        self.violations = data.get('violations', 0)
        self.latitude = data.get('latitude', 0.0)
        self.longitude = data.get('longitude', 0.0)