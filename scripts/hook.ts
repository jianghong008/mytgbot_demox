import { loadEnv } from "../api/utils/env";
async function main() {
    const envs = await loadEnv()
    fetch(`https://api.telegram.org/bot${envs.BOT_TOKEN}/setWebhook?url=https://mytgbot-demox.vercel.app/api/bot`)
    .then(res => res.text())
    .then(res => console.log(res))
    .catch(err => console.log(err))
}

main()