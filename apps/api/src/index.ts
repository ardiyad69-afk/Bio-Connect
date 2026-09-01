import { createApp } from "./app";
import { env } from "./lib/env";

const app = createApp().listen(env.PORT);

console.log(`API listening on http://localhost:${env.PORT}`);
console.log(`Swagger docs at http://localhost:${env.PORT}/swagger`);

export type App = typeof app;
