from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import yaml
import requests
from dotenv import load_dotenv
from julep import Julep

load_dotenv()

app = Flask(__name__)
CORS(app)

WEATHER_API = os.getenv("WEATHER_API")
client = Julep(api_key=os.getenv("JULEP_API_KEY"))

# 🔄 Get or create the agent only once
def get_or_create_agent():
    agents = client.agents.list()
    for a in agents:
        if a.name == "Foodie Tour Agent":
            return a
    return client.agents.create(
        name="Foodie Tour Agent",
        model="claude-3.5-sonnet",
        about="An AI chef and travel planner that creates city-based foodie experiences."
    )

agent = get_or_create_agent()

# 🔄 Get or create task only once
def get_or_create_task():
    tasks = client.tasks.list(agent_id=agent.id)
    for t in tasks:
        if t.name == "City Foodie Tour":
            return t

    task_yaml = """
    name: City Foodie Tour
    description: Generate a food itinerary for a given city based on weather, cuisine, and dietary preferences
    main:
      - prompt:
          - role: system
            content: |
              You are a local food expert and trip planner. Given a city, its weather, and dietary preferences, do the following:
              1. List exactly 3 iconic local dishes.
              2. Decide indoor or outdoor dining based on the weather.
              3. Recommend breakfast, lunch, and dinner — each based on those iconic dishes.
              4. Mention top-rated restaurants for those dishes.
              5. Describe each meal's experience like a narrative.
              6. Do not use Markdown or special formatting like #, *, or ** — keep the output plain and clean.
              7. Consider dietary preferences when recommending dishes and restaurants.
          - role: user
            content: |
              City: ${steps[0].input.city}
              Weather: ${steps[0].input.weather}
              Dietary Preferences: ${steps[0].input.dietary_preferences}
    """
    task_definition = yaml.safe_load(task_yaml)
    return client.tasks.create(agent_id=agent.id, **task_definition)

task = get_or_create_task()

# 🌦️ Fetch weather
def get_weather(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API}&units=metric"
    try:
        res = requests.get(url)
        if res.status_code == 200:
            data = res.json()
            description = data['weather'][0]['description'].capitalize()
            temp = data['main']['temp']
            humidity = data['main']['humidity']
            return f"{description}, {temp}°C, {humidity}% humidity"
    except Exception as e:
        print("Weather API error:", e)
    

# 🚀 POST endpoint
@app.route('/generate-tour', methods=['POST'])
def generate_tour():
    data = request.get_json()
    city = data.get("city", "")
    dietary_preferences = data.get("dietary_preferences", "none")

    if not city:
        return jsonify({"success": False, "error": "City is required"}), 400

    weather = get_weather(city)
    user_input = {
        "city": city,
        "weather": weather,
        "dietary_preferences": dietary_preferences
    }

    try:
        execution = client.executions.create(task_id=task.id, input=user_input)

        # Wait for execution to finish
        while (result := client.executions.get(execution.id)).status not in ['succeeded', 'failed']:
            time.sleep(1)

        if result.status == 'succeeded':
            return jsonify({"success": True, "output": result.output[-1]['content']})
        else:
            return jsonify({"success": False, "error": result.error}), 500

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
