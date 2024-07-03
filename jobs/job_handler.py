import threading
from main import app
from datetime import datetime, timedelta


def ticker(seconds=None, hours=None, minutes=None, days=None):
    now = datetime.now()
    if seconds is not None:
        run_at = now + timedelta(seconds=seconds)
    elif hours is not None:
        run_at = now + timedelta(hours=hours)
    elif minutes is not None:
        run_at = now + timedelta(minutes=minutes)
    elif days is not None:
        run_at = now + timedelta(days=days)
    else:
        raise Exception("time field is required ")
    delay = (run_at - now).total_seconds()
    return delay


class Worker:
    """
    small worker class  for handling background jobs,it might have some few
    issues use it carefully this class requires being monitored carefully to
    handle any new edge case that might arise.

    creating a job with arguments:
    ```
    def job(task):
        work(task)
    worker = Worker(callback_fn=lambda : job(task))
    worker.start()
    ```

    creating jobs with tickers( execute periodically):
    ```
    def worker():
        tempo = datetime.today()
        h, m, s = tempo.hour, tempo.minute, tempo.second
        print(f"{h}:{m}:{s}")

    now = datetime.now()
    run_at = now + timedelta(seconds=3)
    delay = (run_at - now).total_seconds()

    job = Worker(callback_fn=worker, ticker=delay)
    job.start()
    ```


    creating a job with no arguments:
    ```
    def job():
        print("another job.")
    worker = Worker(callback_fn=job)
    worker.start()
    ```

    """

    def __init__(self, callback_fn, ticker=None):
        self.job = callback_fn
        self.ticker = ticker
        self.worker_thread = threading.Thread(target=self.worker, daemon=True)
        self.timer_thread = None
        self.app = app

    def worker(self):
        with self.app.app_context():
            self.job()

    def ticker_worker(self):
        with self.app.app_context():
            self.job()
            self.timer_thread = threading.Timer(self.ticker, self.ticker_worker)  # noqa
            self.timer_thread.start()

    def start(self):
        if self.job is None:
            raise ValueError("No callback function provided.")
        elif self.ticker is not None:
            self.timer_thread = threading.Timer(self.ticker, self.ticker_worker)  # noqa
            self.timer_thread.start()
        else:
            self.worker_thread.start()
