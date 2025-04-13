import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Path to the local file where tokens are stored
const tokenFilePath = path.join(__dirname, '../token.json');

interface TokenData {
    access_token: string;
    refresh_token: string;
    expires_at: number; // Unix timestamp in milliseconds
}

/**
 * Loads the token data from the local token.json file.
 * @returns TokenData object or null if file doesn't exist
 */
const loadTokenFromFile = (): TokenData | null => {
    if (!fs.existsSync(tokenFilePath)) return null;
    const raw = fs.readFileSync(tokenFilePath, 'utf-8');
    return JSON.parse(raw);
};

/**
 * Saves the token data to the local token.json file.
 * @param token - TokenData object to store
 */
const saveTokenToFile = (token: TokenData) => {
    fs.writeFileSync(tokenFilePath, JSON.stringify(token, null, 2));
};

// Load token once at runtime
let token: TokenData | null = loadTokenFromFile();

/**
 * Returns a valid access token.
 * Refreshes the token automatically if expired.
 * @returns the valid access token as string
 */
export const getAccessToken = async (): Promise<string> => {
    const now = Date.now();

    // If token is missing or expired, refresh it
    if (!token || token.expires_at < now) {
        console.log('🔄 Token expired, trying to refresh...');
        token = await refreshAccessToken();
    }

    // Clean up any unexpected newlines
    return token.access_token.replace(/\n/g, '').trim();
};

/**
 * Refreshes the access token using the refresh token.
 * Saves the new token to file and updates the runtime token variable.
 * @returns new TokenData object
 */
export const refreshAccessToken = async (): Promise<TokenData> => {
    console.log('♻️ Refreshing access token...');

    const refresh_token = (token?.refresh_token || process.env.REFRESH_TOKEN)?.replace(/\n/g, '').trim();
    if (!refresh_token) throw new Error('Missing refresh token');

    try {
        const res = await axios.post('https://auth.atlassian.com/oauth/token', {
            grant_type: 'refresh_token',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            refresh_token,
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const newToken: TokenData = {
            access_token: res.data.access_token,
            refresh_token: res.data.refresh_token || refresh_token,
            expires_at: Date.now() + res.data.expires_in * 1000,
        };

        saveTokenToFile(newToken);
        console.log('✅ Token refreshed and saved');
        token = newToken;
        return newToken;

    } catch (err: any) {
        console.error('❌ Failed to refresh token:', err);
        throw new Error('Could not refresh token');
    }
};
