
# Some of my Cloudflare Workers

- [ChatGptTelegramBot](https://github.com/MartinatorTime/CF-Worker-Deploy/tree/main/ChatGptTelegramBot)
- [R6TelegramBot](https://github.com/MartinatorTime/CF-Worker-Deploy/tree/main/R6TelegramBot)

Dont forget to set webhook for each bot

Github action automaticaly deploy with wrangler worker when worker file are updated

To get account id run action Get Account ID  and will get it in action logs below python script

## Add Secrets in Github Action
```
    CF_ACCOUNT_ID (can be get by account-id.py)

    CF_API_EMAIL (your email)

    CF_API_TOKEN (your api token with worker editor acces)

    CF_API_KEY (Full access api key)

    WRANGLER_TOML_CHATGPT (Wrangler code with variables)

    WRANGLER_TOML_R6BOT (Wrangler code with variables)