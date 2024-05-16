import datetime
import json
from kafka import KafkaProducer
from kafka_crashes_record import KafkaCrashesRecord
from utils import load_current_date, save_current_date
import threading
import requests

class DataHandler(threading.Thread):
    def __init__(self, url: str, kafka_topic: str, record_class, date_param, limit=50000):
        super().__init__()
        self.limit = limit
        self.url = url
        self.kafka_topic = kafka_topic
        self.record_class = record_class
        self.producer = KafkaProducer(bootstrap_servers='localhost:9092',
                                      value_serializer=lambda v: json.dumps(v).encode('utf-8'))
        self.current_date = ""
        self.date_param = date_param

    def process_data(self):
        query_date = (datetime.datetime.now() - datetime.timedelta(days=7)) \
                                                        .replace(hour=23, minute=59, second=59, microsecond=99) \
                                                        .strftime('%Y-%m-%dT%H:%M:%S')
        
        if self.current_date == "":
            base_query = f"{self.url}?$where={self.date_param} <= '{query_date}'"  
        else:
            base_query = f"{self.url}?$where={self.date_param} > '{self.current_date}' AND {self.date_param} <= '{query_date}'"
            

        offset = 0
        while True:
            query_url = f"{base_query}&&$limit={self.limit}&&$offset={offset}" 
            
            records = self.fetch_data(query_url)
            if not records:  
                break

            self.send_data(records)

            latest_date = max(getattr(record, self.date_param) for record in records)
            self.current_date = latest_date.strftime('%Y-%m-%dT%H:%M:%S')
            offset += self.limit
            # break
    
    def fetch_data(self, query_url):
        response = requests.get(query_url)
        response.raise_for_status()
        records = [self.record_class(data) for data in response.json()]
        return records

    def send_data(self, records):
        try:
            for record in records:
                kafka_data = record.to_dict()
                self.producer.send(self.kafka_topic, kafka_data)
        except Exception as e:
            print("An error occurred while sending data to Kafka:", e)

    def run(self):
        self.current_date = load_current_date(self.kafka_topic)
        self.process_data()
        save_current_date(self.kafka_topic, self.current_date)    
