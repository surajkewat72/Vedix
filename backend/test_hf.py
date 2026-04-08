import asyncio
import httpx
import json

async def test():
    payload = {
        "model": "mistralai/Mistral-7B-Instruct-v0.2",
        "messages": [
            {"role": "system", "content": "You are a very helpful assistant."},
            {"role": "user", "content": "What is my sign? Write 1 sentence."}
        ],
        "max_tokens": 50,
        "stream": True
    }
    # Wait, the v1 API requires an API key in the headers. We will see if it works without it.
    API_URL = "https://router.huggingface.co/hf-inference/v1/chat/completions"
    
    try:
        async with httpx.AsyncClient() as client:
            async with client.stream("POST", API_URL, json=payload) as response:
                print("Status:", response.status_code)
                async for line in response.aiter_lines():
                    print("Line:", line)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(test())
