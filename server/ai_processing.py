import os
import json
import google.generativeai as genai
import PyPDF2
import docx
from datetime import datetime
from sqlmodel import Session
from dotenv import load_dotenv

# Import DB engine and models
from db import engine
from models import Application, Job

# --- Load API Key ---
load_dotenv()
API_KEY = os.environ.get("GOOGLE_API_KEY")
if not API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in .env file")
genai.configure(api_key=API_KEY)


def parse_resume(file_path: str) -> str:
    """Parses a resume file (PDF or DOCX) and returns the text."""
    text = ""
    try:
        if file_path.endswith('.pdf'):
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() or ""

        elif file_path.endswith('.docx'):
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"

        elif file_path.endswith('.txt'):
            with open(file_path, 'r') as f:
                text = f.read()

        print(f"[Parser]: Successfully parsed {file_path}")
        return text
    except Exception as e:
        print(f"[Parser Error]: Could not parse {file_path}. Error: {e}")
        return f"Error: Could not parse resume file. {e}"


def call_gemini_api(job: Job, app: Application, resume_text: str) -> (str, str):
    """Calls the Gemini API to get a JSON decision."""
    prompt_template = f"""
    You are an expert AI recruiter. Analyze the candidate's application against the job description.

    **Job Description:**
    - Title: {job.title}
    - Required Skills: {', '.join(job.required_skills)}
    - Required Certifications: {', '.join(job.required_certifications)}

    **Candidate's Application:**
    - Cover Letter: {app.cover_letter}
    - Claimed Skills: {', '.join(app.skills)}
    - Claimed Certifications: {', '.join(app.certifications)}
    - Parsed Resume Text: {resume_text}

    **Your Task:**
    Return your decision *only* in the following JSON format:
    {{
      "decision": "ACCEPTED" | "REJECTED" | "PENDING",
      "reasoning": "A brief, one-sentence explanation for your decision."
    }}
    """

    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt_template)
        json_text = response.text.strip().lstrip("```json").rstrip("```")
        data = json.loads(json_text)

        decision = data.get("decision", "PENDING").upper()
        reasoning = data.get("reasoning", "No reasoning provided by AI.")

        if decision not in ["ACCEPTED", "REJECTED", "PENDING"]:
            decision = "PENDING"

        return decision, reasoning
    except Exception as e:
        print(f"[Gemini Error]: {e}")
        return "PENDING", f"AI analysis failed: {e}"


def run_ai_screening(app_id: str, job_id: str):
    """The complete background task."""
    print(f"[Background Task]: Starting for application {app_id}")
    with Session(engine) as session:
        try:
            app = session.get(Application, app_id)
            job = session.get(Job, job_id)
            if not app or not job:
                print(f"[Background Task Error]: Could not find app or job.")
                return

            app.resume_text = parse_resume(app.resume_path)
            decision, reasoning = call_gemini_api(job, app, app.resume_text)

            app.status = decision
            app.ai_reasoning = reasoning
            app.reviewed_at = datetime.utcnow()

            session.add(app)
            session.commit()
            print(f"[Background Task]: Finished for application {app_id}. Decision: {decision}")

        except Exception as e:
            print(f"[Background Task Error]: A critical error occurred: {e}")
            session.rollback()