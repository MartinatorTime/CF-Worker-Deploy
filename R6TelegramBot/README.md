
# R6 Telegram Bot on Cloudflare Worker

This cloudflare worker telegram bot check r6 psn stats, r6 psn server status every 5min, and if server is down send message to chat.

/s USERNAME This season stats

/f USERNAME full stats

/l USERNAME Last matches

/status Check PSN R6 server status

Dont forget like and fork repository :)
## Setup

Setup github secret WRANGLER_TOML_R6BOT with your variables

Run Github action

Dont forget set webhook to your worker url

## WRANGLER_TOML_R6BOT Example
```
name = "r6bot"
compatibility_date = "2023-05-24"
main = "index.js"

kv_namespaces = [
  { binding = "DATABASE", id = "" }
]
[triggers]
crons = ["*/5 * * * *"]

[vars]
TELEGRAM_BOT_TOKEN = ""
ALLOWED_CHAT_ID = ""
MY_USERNAME = ""