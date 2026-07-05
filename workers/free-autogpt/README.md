# Free AutoGPT worker (OfficeMitra Admin bridge)

Bridges the admin **Auto Agent** module to free LLM providers inspired by [Free-AUTOGPT-with-NO-API](https://github.com/Decentralised-AI/Free-AUTOGPT-with-NO-API).

## Setup

```powershell
cd workers/free-autogpt
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# Edit .env with HuggingChat credentials (huggingface.co account)
python server.py
```

## OfficeMitra `.env.local`

```env
AUTOGPT_WORKER_URL=http://127.0.0.1:8765
# optional shared secret
AUTOGPT_WORKER_KEY=
```

Then open **Admin → Auto Agent** and select **Free AutoGPT worker**.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness |
| POST | `/v1/chat` | Single chat turn (used by TS agent loop) |
| POST | `/run` | Multi-step autonomous run |

## Notes

- HuggingChat uses your Hugging Face login — same approach as the upstream Free-AUTOGPT repo.
- Vercel cannot run this worker; run locally or on a VPS and tunnel if needed.
- For production without a worker, use `OPENAI_COMPAT_BASE_URL` (Groq free tier) or `OPENAI_API_KEY`.
