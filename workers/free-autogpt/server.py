"""
Lightweight HTTP bridge for OfficeMitra Admin → Free-AUTOGPT-style providers.
Run: pip install -r requirements.txt && python server.py
"""
from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import urlparse

PORT = int(os.getenv("AUTOGPT_WORKER_PORT", "8765"))
AUTH_KEY = os.getenv("AUTOGPT_WORKER_KEY", "")


def check_auth(headers) -> bool:
    if not AUTH_KEY:
        return True
    auth = headers.get("Authorization", "")
    return auth == f"Bearer {AUTH_KEY}"


def huggingchat_reply(prompt: str) -> str:
    email = os.getenv("emailHF") or os.getenv("HUGGINGCHAT_EMAIL")
    password = os.getenv("pswHF") or os.getenv("HUGGINGCHAT_PASSWORD")
    if not email or not password:
        raise RuntimeError("Set emailHF and pswHF in workers/free-autogpt/.env")

    from hugchat import hugchat
    from hugchat.login import Login

    sign = Login(email, password)
    cookies = sign.login()
    bot = hugchat.ChatBot(cookies=cookies.get_dict())
    return bot.chat(prompt, temperature=0.5, stream=False)


def ollama_reply(messages: list[dict[str, str]]) -> str:
    import urllib.request

    base = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "llama3.2")
    payload = json.dumps({"model": model, "messages": messages, "stream": False}).encode()
    req = urllib.request.Request(
        f"{base}/api/chat",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        data = json.loads(resp.read().decode())
    content = (data.get("message") or {}).get("content", "").strip()
    if not content:
        raise RuntimeError("Empty Ollama response")
    return content


def run_task(task: str, provider: str, max_iterations: int) -> dict[str, Any]:
    steps: list[dict[str, Any]] = []
    context = f"Goal: {task}\n\nWork step by step and produce a final practical answer for AP government office staff."

    for i in range(1, max_iterations + 1):
        prompt = (
            f"{context}\n\nStep {i}/{max_iterations}. "
            "If you can finish now, write FINAL ANSWER: followed by the complete output. "
            "Otherwise write your next step only."
        )
        if provider == "ollama":
            observation = ollama_reply([{"role": "user", "content": prompt}])
        else:
            observation = huggingchat_reply(prompt)

        steps.append({"step": i, "thought": f"Iteration {i}", "action": "think", "observation": observation[:2000]})
        context += f"\n\nStep {i} output:\n{observation}"

        if "FINAL ANSWER:" in observation.upper():
            final = observation.split("FINAL ANSWER:", 1)[-1].strip()
            return {"success": True, "final_answer": final, "steps": steps}

    return {"success": True, "final_answer": steps[-1]["observation"] if steps else "", "steps": steps}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:
        print(f"[worker] {self.address_string()} - {fmt % args}")

    def _json(self, code: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if urlparse(self.path).path == "/health":
            self._json(200, {"ok": True})
            return
        self._json(404, {"error": "Not found"})

    def do_POST(self) -> None:
        if not check_auth(self.headers):
            self._json(401, {"error": "Unauthorized"})
            return

        path = urlparse(self.path).path
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length).decode() if length else "{}"
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            self._json(400, {"error": "Invalid JSON"})
            return

        try:
            if path == "/v1/chat":
                messages = data.get("messages") or []
                user = "\n\n".join(m.get("content", "") for m in messages if m.get("role") == "user")
                provider = os.getenv("AUTOGPT_DEFAULT_PROVIDER", "huggingchat")
                if provider == "ollama":
                    content = ollama_reply(messages)
                else:
                    content = huggingchat_reply(user or messages[-1]["content"])
                self._json(200, {"content": content})
                return

            if path == "/run":
                task = (data.get("task") or "").strip()
                if len(task) < 10:
                    self._json(400, {"error": "task too short"})
                    return
                provider = data.get("provider") or "huggingchat"
                max_iter = min(10, max(1, int(data.get("max_iterations") or 3)))
                result = run_task(task, provider, max_iter)
                self._json(200, result)
                return

            self._json(404, {"error": "Not found"})
        except Exception as exc:
            self._json(500, {"error": str(exc)})


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv()
    print(f"AutoGPT worker listening on http://127.0.0.1:{PORT}")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
