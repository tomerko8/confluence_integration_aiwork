import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * Step 1: Redirects the user to Atlassian's authorization screen to begin OAuth2 flow.
 * This endpoint constructs the correct authorization URL and sends the user there.
 */
router.get('/auth', (req: Request, res: Response) => {
    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${process.env.CLIENT_ID}&scope=read:confluence-content.all%20read:confluence-content.summary%20read:confluence-space.summary&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&prompt=consent`;
    res.redirect(authUrl);
});

/**
 * Step 2: Callback endpoint that receives the authorization code after user consents.
 * Exchanges the code for an access token using Atlassian's token endpoint.
 */
router.get('/oauth/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string;

    try {
        const response = await axios.post('https://auth.atlassian.com/oauth/token', {
            grant_type: 'authorization_code',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code,
            redirect_uri: process.env.REDIRECT_URI,
        });

        const accessToken = response.data.access_token;
        console.log('Access Token:', accessToken);

        // Note: For simplicity, this stores the token in memory. In production, use a persistent store.
        process.env.ACCESS_TOKEN = accessToken;

        res.send('✅ Authentication successful! Access token was saved.');
    } catch (error: any) {
        console.error('❌ Error exchanging code for token:', error.response?.data || error.message);
        res.status(500).send('Authentication failed');
    }
});

export default router;
