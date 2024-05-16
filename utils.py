import json
from datetime import datetime

CURRENT_DATE_FILE = "current_date.json"

def load_current_date(kafka_topic):
    """Loads the current date for the specified Kafka topic from the file.
       Returns an empty string if the file doesn't exist, is empty, or the topic is not found.
    """
    try:
        with open(CURRENT_DATE_FILE, 'r') as f:
            data = json.load(f)
            return data.get(kafka_topic, "") 
    except FileNotFoundError:
        return ""  
    except json.JSONDecodeError:
        return ""

def save_current_date(kafka_topic, current_date):
    """Saves the current date for a given Kafka topic to a JSON file.

    Args:
        kafka_topic: The Kafka topic name.
        current_date: A datetime object representing the current date.
    """

    try:
        with open(CURRENT_DATE_FILE, 'r+') as f:
            data = json.load(f)
            data[kafka_topic] = current_date
            f.seek(0)
            json.dump(data, f, indent=4)
            f.truncate()
    except FileNotFoundError:
        with open(CURRENT_DATE_FILE, 'w') as f:
            json.dump({kafka_topic: current_date}, f, indent=4)
    except json.JSONDecodeError:
        with open(CURRENT_DATE_FILE, 'w') as f:
            json.dump({kafka_topic: current_date}, f, indent=4)