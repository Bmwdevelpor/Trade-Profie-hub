import appModule from "../dist/server.cjs";

// Handle ESM default wrapper or direct default exports safely
const app = appModule.default || appModule;

export default app;
