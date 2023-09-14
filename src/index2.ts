import {Hono} from 'hono'

import Seed from './models/plans/seed'

const app = new Hono()


app.get('/', (c) => {
    let event = c.event;
    const url = new URL(event.request.url)

    switch (url.pathname) {
        case WEBHOOK:
            return event.respondWith(handleWebhook(event))
            break;
        case '/registerWebhook':
            return event.respondWith(registerWebhook(event, url, WEBHOOK, SECRET))
            break;
        case '/unRegisterWebhook':
            return event.respondWith(unRegisterWebhook(event))
            break;
        default:
            return event.respondWith(new Response('No handler for this request'))
            break;
    }

    // Bot().processMessage(c)

    // return c.text('Usage Instruction....')
})

app.get('/register', (c) => {
    return c.text('Usage Instruction....')
})


app.all('/bot', (c) => {

    return c.text(`req param: ${JSON.stringify(c.req.path)}`)
})

export default app
