// test/integration.test.ts
import { expect } from 'chai';
import request from 'supertest';
import http from 'http';
import app from '../src/app';

let server: http.Server;
let baseURL: string;

describe('Confluence Integration API', () => {
    before((done) => {
        server = app.listen(0, () => {
            const address = server.address();
            if (address && typeof address === 'object') {
                baseURL = `http://localhost:${address.port}`;
                console.log('🔧 Test server started on', baseURL);
                done();
            } else {
                throw new Error('Unable to determine test server port');
            }
        });
    });

    after((done) => {
        server.close(() => {
            console.log('🧹 Test server stopped');
            done();
        });
    });

    /**
     * Test that verifies fetching all pages from a given Confluence space
     */
    it('should fetch pages list from space', async () => {
        const res = await request(baseURL).get('/api/pages?spaceKey=DevTest');

        expect(res.status).to.equal(200);
        expect(res.body.results).to.be.an('array');
    });

    /**
     * Test that verifies retrieving the content of a specific Confluence page by ID
     */
    it('should fetch page content by ID', async () => {
        const res = await request(baseURL).get('/api/pages/65699');

        expect(res.status).to.equal(200);
        expect(res.body.body.storage.value).to.include('<ul>');
    });

    /**
     * Test that verifies proper error handling when spaceKey is missing
     */
    it('should return 400 if spaceKey is missing', async () => {
        const res = await request(baseURL).get('/api/pages');

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('error');
    });

    /**
     * Test that verifies correct title is returned for a known page ID
     */
    it('should return correct page title for known ID', async () => {
        const res = await request(baseURL).get('/api/pages/65699');

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('title');
        expect(res.body.title).to.include('Car Technology');
    });
});
