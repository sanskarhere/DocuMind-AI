import os
import uuid
import tempfile

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from Src.pipeline.rag_pipeline import RAGPipeline
from dotenv import load_dotenv


load_dotenv()
app = Flask(
    __name__,
    static_folder='frontend/dist/client',
    static_url_path=""
)
CORS(app, resources={r"/api/*": {"origins": "*"}})


sessions: dict = {}


@app.route("/api/upload", methods=["POST"])
def upload_pdf():

    # 1. Validate file is in the request
    if "file" not in request.files:
        return jsonify({"error": "No file provided. Field name must be 'file'."}), 400

    file = request.files["file"]

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported."}), 400

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    try:
        file.save(tmp.name)
        tmp.close()

        pipeline = RAGPipeline(tmp.name)
        result = pipeline.build_index() 
        print(f"[Upload] {result} | file: {file.filename}")

    except Exception as e:
        print(f"[Upload ERROR] {e}")
        return jsonify({"error": f"Failed to process PDF: {str(e)}"}), 500

    finally:
       
        if os.path.exists(tmp.name):
            os.unlink(tmp.name)

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "pipeline": pipeline,
        "filename": file.filename
    }

    print(f"[Upload] Session created → {session_id}")

    return jsonify({
        "message": f"'{file.filename}' processed successfully.",
        "session_id": session_id
    }), 200



@app.route("/api/chat", methods=["POST"])
@app.route("/api/chat", methods=["POST"])
def chat():

    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body must be JSON."}), 400

    question = data.get("question", "").strip()
    session_id = data.get("session_id", "").strip()

    if not question:
        return jsonify({"error": "Question is required."}), 400

    if not session_id:
        return jsonify({"error": "Session ID is required."}), 400

    session = sessions.get(session_id)

    if not session:
        return jsonify({
            "error": "Session not found. Please upload PDF again."
        }), 404

    try:

        pipeline = session["pipeline"]

        answer = pipeline.ask(question)

        print(f"[Chat] Q: {question}")
        print(f"[Chat] A: {answer}")

        return jsonify({
            "answer": answer
        }), 200

    except Exception as e:

        import traceback

        print("\n========== CHAT ERROR ==========")
        traceback.print_exc()
        print("================================\n")

        return jsonify({
            "error": str(e)
        }), 500

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    full_path = os.path.join(app.static_folder, path)
    if path and os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    print("\n DocuMind AI — Server Starting")
    print("=" * 45)
    print("  Login     →  http://localhost:5000/login.html")
    print("  Register  →  http://localhost:5000/register.html")
    print("  App       →  http://localhost:5000")
    print("  Upload    →  POST /api/upload")
    print("  Chat      →  POST /api/chat")
    print("=" * 45)

    os.makedirs("artifacts/faiss_index", exist_ok=True)

    app.run(debug=True, port=5000, host="0.0.0.0")
