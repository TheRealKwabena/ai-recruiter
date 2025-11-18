# test_ai.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Load the API Key
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ Error: GOOGLE_API_KEY not found in .env file.")
    exit()

print(f"✅ API Key found: {api_key[:5]}...")

# 2. Configure the API
genai.configure(api_key=api_key)

# 3. List Available Models
print("\n🔎 Listing available models for your key...")
try:
    available_models = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f" - {m.name}")
            available_models.append(m.name)
except Exception as e:
    print(f"❌ Error listing models: {e}")
    exit()

# 4. Test Generation
# We will try to pick a model that actually exists from the list above
# valid_model = 'models/gemini-1.5-flash'
valid_model = 'models/gemini-pro' # Fallback that almost always works

if 'models/gemini-1.5-flash' in available_models:
    valid_model = 'gemini-1.5-flash'
elif 'models/gemini-pro' in available_models:
    valid_model = 'gemini-pro'
else:
    # Take the first available text model
    valid_model = available_models[0].replace('models/', '')

print(f"\n🧪 Testing generation with model: {valid_model} ...")

try:
    model = genai.GenerativeModel(valid_model)
    response = model.generate_content("Hello, are you working?")
    print(f"\n✅ SUCCESS! AI Response: {response.text}")
except Exception as e:
    print(f"\n❌ GenAI Error: {e}")