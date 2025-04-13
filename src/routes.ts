// src/routes.ts
import { Router, Request, Response } from 'express';
import axios from 'axios';
import { listPages, getPageContent } from './confluence';

const router = Router();

/**
 * Step 1: Redirects the user to Atlassian's authorization page.
 * This initializes the OAuth2 Authorization Code flow.
 */
router.get('/auth', (req: Request, res: Response) => {
    const clientId = process.env.CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.REDIRECT_URI || '');
    const scopes = [
        'read:confluence-content.all',
        'read:confluence-content.summary',
        'read:confluence-space.summary',
        'offline_access'
    ].join(' ');

    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${redirectUri}&response_type=code&prompt=consent`;

    res.redirect(authUrl);
});

/**
 * Step 2: Callback endpoint that receives the authorization code.
 * Exchanges the code for access and refresh tokens and displays them for the user to copy.
 */
router.get('/callback', async (req: Request, res: Response) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('Missing code from query params');
    }

    try {
        const tokenRes = await axios.post('https://auth.atlassian.com/oauth/token', {
            grant_type: 'authorization_code',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code,
            redirect_uri: process.env.REDIRECT_URI
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const accessToken = tokenRes.data.access_token;
        const refreshToken = tokenRes.data.refresh_token;

        console.log('\n✅ ACCESS_TOKEN:\n', accessToken);
        console.log('\n♻️ REFRESH_TOKEN:\n', refreshToken);

        res.send(
            `🔑 Tokens received!<br>
            Copy and paste the following into your .env file:<br><br>
            ACCESS_TOKEN=${accessToken}<br>
            REFRESH_TOKEN=${refreshToken}`
        );
    } catch (err: any) {
        console.error('❌ Failed to fetch access token:', err.response?.data || err.message);
        res.status(500).send('Failed to exchange code for token');
    }
});

/**
 * Step 3: Retrieve a list of Confluence pages from a given space.
 * Query parameter: spaceKey
 */
router.get('/pages', async (req: Request, res: Response) => {
    const spaceKey = req.query.spaceKey as string;

    if (!spaceKey) {
        return res.status(400).json({ error: 'Missing spaceKey' });
    }

    try {
        const pages = await listPages(spaceKey);
        res.json(pages);
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

/**
 * Step 4: Retrieve content of a specific Confluence page by its ID.
 * Route parameter: id
 */
router.get('/pages/:id', async (req: Request, res: Response) => {
    const pageId = req.params.id;

    try {
        const content = await getPageContent(pageId);
        res.json(content);
    } catch (error) {
        console.error('Error fetching page content:', error);
        res.status(500).json({ error: 'Failed to fetch page content' });
    }
});

export default router;
