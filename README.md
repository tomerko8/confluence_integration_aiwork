# 🧠 Confluence Integration

This project is a TypeScript + Node.js integration with Atlassian Confluence.  
It demonstrates how to implement an OAuth2 Authorization Code flow, fetch data from Confluence REST APIs, and manage access tokens securely.

✅ The integration includes:

- OAuth2 Authorization Code Grant with Refresh Token support
- Fetching pages from a Confluence space
- Retrieving content of a specific page
- Automatic token refreshing
- Basic test coverage
- Clean project structure & documentation

---

## 🚀 Features

- 🔐 **OAuth2 Authorization Code Flow** with `access_token` + `refresh_token`
- 📄 **List Pages** by space key
- 📘 **Fetch Page Content** by page ID
- 🔄 **Automatic Token Refreshing**
- 📁 **Persistent Token Storage** in `token.json`
- 🧪 **Automated Tests** using Mocha + Chai

---

## 📁 Project Structure

```bash
confluence-integration/
│
├── src/
│   ├── app.ts              # Sets up the Express app and middleware
│   ├── index.ts            # Starts the server
│   ├── routes.ts           # Express routes (OAuth + API endpoints)
│   ├── oauth.ts            # Handles OAuth2 flow (optional split)
│   ├── tokenManager.ts     # Loads/saves/refreshes tokens
│   ├── confluence.ts       # API logic to call Confluence endpoints
│
├── test/
│   └── integration.test.ts # Integration tests for endpoints
│
├── .env                    # Your credentials and token placeholders
├── token.json              # Stored token data (access_token + refresh_token + expiry)
├── package.json
├── tsconfig.json
└── README.md
```




## 📸 Screenshots

### App Settings
![App Settings](./screenshots/App%20Settings.PNG)

### Authorization Settings
![Authorization Settings](./screenshots/Authorization%20Settings.PNG)

### API Scopes
![Scopes view](./screenshots/Scopes%20view.png)

---

## ⚙️ Environment Setup

1. Duplicate `.env.example` as `.env` and fill in your credentials:

```env
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
REDIRECT_URI=http://localhost:3000/api/callback
ACCESS_TOKEN=
REFRESH_TOKEN=
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm run start
```

---

## 🔐 Authentication Flow

1. Open your browser to:

```
http://localhost:3000/api/auth
```

2. You'll be redirected to Atlassian's authorization screen.

3. After accepting, your browser will be redirected to `/api/callback`.

4. You’ll receive your `ACCESS_TOKEN` and `REFRESH_TOKEN` (automatically saved to `token.json`).

5. From now on, the app will auto-refresh tokens when needed and keep them stored in `token.json`.

---

## 🌐 Test via Browser

You can directly test the API from your browser:

- 🔍 List pages from a space (replace `DevTest` if needed):

```
http://localhost:3000/api/pages?spaceKey=DevTest
```

- 📄 Get content of a specific page by ID:

```
http://localhost:3000/api/pages/65699
```

```
http://localhost:3000/api/pages/327815
```

Make sure you have completed the OAuth flow first via:
```
http://localhost:3000/api/auth
```

---

## 🧪 Testing

Run the following command:

```bash
npm run test
```

It will start a temporary Express server and run integration tests against:

- `/api/pages?spaceKey=DevTest`
- `/api/pages/:id`

Test coverage can be extended by mocking token failures, expired tokens, and edge cases.

---

## 📚 API Endpoints

| Method | Route                           | Description                            |
|--------|----------------------------------|----------------------------------------|
| `GET`  | `/api/auth`                     | Redirect to Atlassian login screen     |
| `GET`  | `/api/callback`                 | Handle OAuth2 callback and save token  |
| `GET`  | `/api/pages?spaceKey=DevTest`   | List all pages in a space              |
| `GET`  | `/api/pages/:id`                | Fetch a specific page's HTML content   |

---

## 🛡️ Notes on Token Security

- **DO NOT** commit your `.env` or `token.json` files to GitHub.
- Use a `.gitignore` file that excludes sensitive files:

```bash
# .gitignore
.env
token.json
node_modules/
dist/
```

---

## 📄 License

MIT – Use freely.

---

## ✍️ Author

Tomer Koren  
Email: tomerko@gmail.com  
Project for: *Integrations Developer Role @ ai.work*