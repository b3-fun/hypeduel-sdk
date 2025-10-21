import { HypeDuelSDK } from './sdk';
import { WebhookPayload } from './types';

/**
 * Express.js adapter
 * Usage:
 *   const sdk = new HypeDuelSDK({ debug: true });
 *   app.post('/webhook/hypeduel', createExpressHandler(sdk));
 */
export function createExpressHandler(sdk: HypeDuelSDK) {
    return async (req: any, res: any) => {
        try {
            const payload: WebhookPayload = req.body;
            const matchClient = await sdk.handleWebhook(payload);
            
            res.status(200).json({
                success: true,
                matchId: matchClient.matchId,
                message: 'Webhook received and match client connected'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: (error as Error).message
            });
        }
    };
}

/**
 * Fastify adapter
 * Usage:
 *   const sdk = new HypeDuelSDK({ debug: true });
 *   fastify.post('/webhook/hypeduel', createFastifyHandler(sdk));
 */
export function createFastifyHandler(sdk: HypeDuelSDK) {
    return async (request: any, reply: any) => {
        try {
            const payload: WebhookPayload = request.body;
            const matchClient = await sdk.handleWebhook(payload);
            
            return reply.status(200).send({
                success: true,
                matchId: matchClient.matchId,
                message: 'Webhook received and match client connected'
            });
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: (error as Error).message
            });
        }
    };
}

/**
 * Koa adapter
 * Usage:
 *   const sdk = new HypeDuelSDK({ debug: true });
 *   router.post('/webhook/hypeduel', createKoaHandler(sdk));
 */
export function createKoaHandler(sdk: HypeDuelSDK) {
    return async (ctx: any) => {
        try {
            const payload: WebhookPayload = ctx.request.body;
            const matchClient = await sdk.handleWebhook(payload);
            
            ctx.status = 200;
            ctx.body = {
                success: true,
                matchId: matchClient.matchId,
                message: 'Webhook received and match client connected'
            };
        } catch (error) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: (error as Error).message
            };
        }
    };
}

/**
 * Next.js API Route adapter
 * Usage:
 *   const sdk = new HypeDuelSDK({ debug: true });
 *   export default createNextHandler(sdk);
 */
export function createNextHandler(sdk: HypeDuelSDK) {
    return async (req: any, res: any) => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const payload: WebhookPayload = req.body;
            const matchClient = await sdk.handleWebhook(payload);
            
            res.status(200).json({
                success: true,
                matchId: matchClient.matchId,
                message: 'Webhook received and match client connected'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: (error as Error).message
            });
        }
    };
}

/**
 * Generic HTTP handler (works with Node.js http module)
 * Usage:
 *   const sdk = new HypeDuelSDK({ debug: true });
 *   const server = http.createServer(createHttpHandler(sdk));
 */
export function createHttpHandler(sdk: HypeDuelSDK) {
    return async (req: any, res: any) => {
        if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
        }

        let body = '';
        req.on('data', (chunk: any) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const payload: WebhookPayload = JSON.parse(body);
                const matchClient = await sdk.handleWebhook(payload);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    matchId: matchClient.matchId,
                    message: 'Webhook received and match client connected'
                }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: (error as Error).message
                }));
            }
        });
    };
}

/**
 * Hono adapter
 * Usage:
 *   const sdk = new HypeDuelSDK({ debug: true });
 *   app.post('/webhook/hypeduel', createHonoHandler(sdk));
 */
export function createHonoHandler(sdk: HypeDuelSDK) {
    return async (c: any) => {
        try {
            const payload: WebhookPayload = await c.req.json();
            const matchClient = await sdk.handleWebhook(payload);
            
            return c.json({
                success: true,
                matchId: matchClient.matchId,
                message: 'Webhook received and match client connected'
            }, 200);
        } catch (error) {
            return c.json({
                success: false,
                error: (error as Error).message
            }, 400);
        }
    };
}

