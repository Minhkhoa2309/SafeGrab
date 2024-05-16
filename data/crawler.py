from data_handler import DataHandler
from kafka_crashes_record import KafkaCrashesRecord
from kafka_redlight_record import KafkaRedlightCamRecord
from kafka_speed_record import KafkaSpeedCamRecord

if __name__ == "__main__":
    print("Start crawling")
    crashes_crawler = DataHandler("https://data.cityofchicago.org/resource/85ca-t3if.json",
                                  "crashes", KafkaCrashesRecord, "crash_date")
    redlight_crawler = DataHandler("https://data.cityofchicago.org/resource/spqx-js37.json",
                                  "redlight_cam", KafkaRedlightCamRecord, "violation_date")
    speed_crawler = DataHandler("https://data.cityofchicago.org/resource/hhkd-xvj4.json",
                                  "speed_cam", KafkaSpeedCamRecord, "violation_date")
    
    crashes_crawler.start()
    redlight_crawler.start()
    speed_crawler.start()


    crashes_crawler.join()
    redlight_crawler.join()
    speed_crawler.join()
    print("End Crawler")