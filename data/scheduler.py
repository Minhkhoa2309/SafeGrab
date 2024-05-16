import schedule
import time
import subprocess
import argparse
from datetime import datetime

def run_crawler():
    subprocess.run(["python3", "data/crawler.py"])

def get_schedule_time(args):
    hour = "10"
    minute = "00"
    if args.hour is not None:
        hour = f"{args.hour:02d}"
    if args.minute is not None:
        minute = f"{args.minute:02d}"
    return f"{hour}:{minute}"

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Schedule the crawler script.')
    parser.add_argument('-hour', '--hour', type=int, help='Hour of the day to run the script (0-23)')
    parser.add_argument('-minute', '--minute', type=int, help='Minute of the hour to run the script (0-59)')

    args = parser.parse_args()

    schedule_time = get_schedule_time(args)
    print(f"Scheduling crawler to run daily at {schedule_time}")

    schedule.every().day.at(schedule_time).do(run_crawler)

    while True:
        schedule.run_pending()
        time.sleep(1)
