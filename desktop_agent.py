"""
Background window tracker using pygetwindow.
Logs timestamp and window title whenever the active desktop window changes.
Batches window history and sends to AI for productivity analysis.
"""

import time
import pygetwindow as gw
from datetime import datetime
import requests

BACKEND_URL = "http://127.0.0.1:8000"
USER_ID = "hackathon_demo_user"

window_history = []


def analyze_productivity(history: list[str], collected_at: str):
    """Send window history to backend for real AI analysis (Gemini)."""
    print("\n--- Sending to AI for analysis ---")
    print(f"Window history: {history}")

    try:
        payload = {
            "user_id": USER_ID,
            "window_history": history,
            "collected_at": collected_at,
        }
        response = requests.post(f"{BACKEND_URL}/analyze-activity", json=payload, timeout=15)
        data = response.json()

        summary = data.get("summary", "Analysis failed")
        status = data.get("status", "unknown")

        print(f"[AI Analysis] {summary}")
        print(f"Status: {status}")
    except requests.exceptions.ConnectionError:
        print("Backend not reachable. Is uvicorn running on port 8000?")
    except Exception as e:
        print(f"Error: {e}")
    print("---------------------------------\n")


def monitor_activity():
    """Monitor active window, log changes, and batch-analyze productivity."""
    last_window = ""
    print("Desktop Agent Active. Monitoring productivity...")

    while True:
        try:
            active_window = gw.getActiveWindow()
            if active_window is not None and hasattr(active_window, "title") and active_window.title != "":
                current_title = active_window.title

                if current_title != last_window:
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    print(f"[{timestamp}] Logged: {current_title}")

                    window_history.append(current_title)
                    last_window = current_title

                    if len(window_history) >= 5:
                        collected_at = datetime.now().isoformat()
                        analyze_productivity(window_history.copy(), collected_at)
                        window_history.clear()

        except Exception:
            pass

        time.sleep(2)


if __name__ == "__main__":
    try:
        monitor_activity()
    except KeyboardInterrupt:
        print("\nWindow tracker stopped.")
