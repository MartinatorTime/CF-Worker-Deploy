# R6 Status Check Telegram Bot on Cloudflare Worker

This Cloudflare Worker ChatGPT bot, easy to setup and serverless


Dont forget like and fork repository :)
## Setup

Setup github secret WRANGLER_TOML_CHATGPT with your variables

Run Github action

Dont forget set webhook to your worker url

## TNX for code

- [TBXark](https://github.com/TBXark/ChatGPT-Telegram-Workers)

## WRANGLER_TOML_CHATGPT Example
```
name = "chatgpt"
compatibility_date = "2023-05-24"
main = "chatgpt.js"

kv_namespaces = [
  { binding = "DATABASE", id = "" }
]

[vars]
API_KEY = "" OpenAi or custom endpoint API Key
CHAT_WHITE_LIST = ""
TELEGRAM_AVAILABLE_TOKENS = ""
API_DOMAIN = "https://api.openai.com" Or change to custom endpoint