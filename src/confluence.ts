import axios from 'axios';
import { getAccessToken, refreshAccessToken } from './tokenManager';

let cachedCloudId: string | null = null;

/**
 * Retrieves and caches the Atlassian Cloud ID associated with the current access token.
 * This is required to make API requests to the specific Confluence instance.
 */
const getCloudId = async (): Promise<string> => {
    if (cachedCloudId !== null) return cachedCloudId;

    const token = await getAccessToken();

    const res = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const cloudId = res.data[0].id as string;
    cachedCloudId = cloudId;
    return cloudId;
};

/**
 * Helper function to wrap any request with token refresh logic.
 * If a 401 Unauthorized error occurs, the token is refreshed and the request retried.
 */
const fetchWithRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
        return await fn();
    } catch (err: any) {
        if (err.response?.status === 401) {
            console.warn('🔄 Token expired, trying to refresh...');
            await refreshAccessToken();
            return await fn(); // Retry after refreshing the token
        }
        throw err;
    }
};

/**
 * Fetches a list of Confluence pages within a given space.
 *
 * @param spaceKey - The key of the Confluence space to query.
 * @returns A list of page metadata including ID, title, and version info.
 */
export const listPages = async (spaceKey: string) => {
    return fetchWithRetry(async () => {
        const token = await getAccessToken();
        const cloudId = await getCloudId();

        const response = await axios.get(
            `https://api.atlassian.com/ex/confluence/${cloudId}/wiki/rest/api/content`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    spaceKey,
                    expand: 'version'
                }
            }
        );

        return response.data;
    });
};

/**
 * Fetches the full storage format content of a specific Confluence page.
 *
 * @param pageId - The ID of the page to fetch.
 * @returns The full page content including HTML storage format.
 */
export const getPageContent = async (pageId: string) => {
    return fetchWithRetry(async () => {
        const token = await getAccessToken();
        const cloudId = await getCloudId();

        const response = await axios.get(
            `https://api.atlassian.com/ex/confluence/${cloudId}/wiki/rest/api/content/${pageId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    expand: 'body.storage'
                }
            }
        );

        return response.data;
    });
};
