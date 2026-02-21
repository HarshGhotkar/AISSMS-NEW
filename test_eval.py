import requests

# This simulates exactly what the React frontend will send us later
payload = {
    "user_id": "hackathon_demo_user",
    "scenario_question": "Design a database schema for a library management system.",
    "student_answer": "I would create three tables: Books, Users, and Checkouts. Books has book_id, Users has user_id, and Checkouts links them with a due_date."
}

print("Sending student answer to the AI Evaluator...")

# We fire the request to our local FastAPI server
response = requests.post("http://127.0.0.1:8000/evaluate", json=payload)

# Print the final grade received from the backend
print("\n--- GRADING RESULT ---")
print(response.json())