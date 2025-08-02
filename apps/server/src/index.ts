import "dotenv/config";
import { cors } from "@elysiajs/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Elysia } from "elysia";
import { auth } from "./lib/auth";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { chatRouter } from "./routers/chat";
import "./trigger/daily-idea-generation"; // Initialize Trigger.dev jobs

const _app = new Elysia()
	.use(
		cors({
			origin: process.env.CORS_ORIGIN || "",
			methods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.use(chatRouter)
	.all("/api/auth/*", async (context) => {
		const { request } = context;
		if (["POST", "GET"].includes(request.method)) {
			return auth.handler(request);
		}
		context.error(405);
	})
	.all("/trpc/*", async (context) => {
		const res = await fetchRequestHandler({
			endpoint: "/trpc",
			router: appRouter,
			req: context.request,
			createContext: () => createContext({ context }),
		});
		return res;
	})
	.get("/", () => "OK")
	.listen({
		port: 3000,
		idleTimeout: 255,
	}, () => {
		console.log("Server is running on http://localhost:3000");
	});
