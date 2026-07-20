import "reflect-metadata";
import "./instrument";

import { Logger } from "nestjs-pino";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { type FastifyReply, type FastifyRequest } from "fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { BetterAuthService } from "./modules/auth/better-auth";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });
  mountBetterAuth(app, app.get(BetterAuthService));
  app.setGlobalPrefix("api/v1");

  const config = new DocumentBuilder()
    .setTitle("Chinta API")
    .setDescription("REST and SSE API for the Chinta AI workspace.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(Number(process.env.API_PORT ?? 4000), "0.0.0.0");
}

void bootstrap();

function mountBetterAuth(
  app: NestFastifyApplication,
  betterAuth: BetterAuthService,
) {
  const fastify = app.getHttpAdapter().getInstance();

  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    handler: async (request, reply) => {
      const response = await betterAuth.handler(toWebRequest(request));
      await sendWebResponse(reply, response);
    },
  });
}

function toWebRequest(request: FastifyRequest) {
  const host = request.headers.host ?? "localhost";
  const protocol = getHeader(request, "x-forwarded-proto") ?? "http";
  const url = `${protocol}://${host}${request.url}`;
  const headers = new Headers();

  for (const [key, value] of Object.entries(request.headers)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => headers.append(key, entry));
    } else {
      headers.set(key, value);
    }
  }

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    if (request.body !== undefined) {
      init.body =
        typeof request.body === "string"
          ? request.body
          : JSON.stringify(request.body);
    }
  }

  return new Request(url, init);
}

async function sendWebResponse(reply: FastifyReply, response: Response) {
  reply.status(response.status);

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      reply.header(key, value);
    }
  });

  const cookieHeaders = getSetCookieHeaders(response.headers);
  cookieHeaders.forEach((cookie) => reply.header("set-cookie", cookie));

  const body = Buffer.from(await response.arrayBuffer());
  reply.send(body);
}

function getHeader(request: FastifyRequest, name: string) {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function getSetCookieHeaders(headers: Headers) {
  const withGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  return withGetSetCookie.getSetCookie?.() ?? [];
}
