// src/index.ts
import app from './app';

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
