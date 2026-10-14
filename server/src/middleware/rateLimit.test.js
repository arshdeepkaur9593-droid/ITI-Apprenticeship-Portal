import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";
import rateLimit from "./rateLimit.js";

const createResponse = () => {
  const response = new EventEmitter();
  response.headers = {};
  response.statusCode = 200;
  response.setHeader = (name, value) => {
    response.headers[name] = value;
  };
  response.status = (statusCode) => {
    response.statusCode = statusCode;
    return response;
  };
  response.json = (body) => {
    response.body = body;
    return response;
  };
  response.finish = (statusCode) => {
    response.statusCode = statusCode;
    response.emit("finish");
  };
  return response;
};

const sendRequest = (middleware, ip, response = createResponse()) => {
  let continued = false;
  middleware(
    { ip, socket: { remoteAddress: ip } },
    response,
    () => {
      continued = true;
    },
  );
  return { response, continued };
};

test("login throttling releases successful requests and counts failed responses", () => {
  const middleware = rateLimit({
    windowMs: 60_000,
    max: 2,
    message: "Too many unsuccessful login attempts.",
    skipSuccessfulRequests: true,
  });

  for (let index = 0; index < 5; index += 1) {
    const { response, continued } = sendRequest(middleware, "192.0.2.1");
    assert.equal(continued, true);
    response.finish(200);
  }

  for (let index = 0; index < 2; index += 1) {
    const { response, continued } = sendRequest(middleware, "192.0.2.1");
    assert.equal(continued, true);
    response.finish(401);
  }

  const blocked = sendRequest(middleware, "192.0.2.1");
  assert.equal(blocked.continued, false);
  assert.equal(blocked.response.statusCode, 429);
  assert.equal(blocked.response.headers["Retry-After"], 60);
  assert.deepEqual(blocked.response.body, {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many unsuccessful login attempts.",
    retryAfter: 60,
  });

  assert.equal(sendRequest(middleware, "192.0.2.2").continued, true);
});

test("login failure limit resets when its window expires", async () => {
  const middleware = rateLimit({
    windowMs: 30,
    max: 1,
    message: "Too many unsuccessful login attempts.",
    skipSuccessfulRequests: true,
  });

  const firstAttempt = sendRequest(middleware, "192.0.2.3");
  firstAttempt.response.finish(401);
  assert.equal(sendRequest(middleware, "192.0.2.3").response.statusCode, 429);

  await new Promise((resolve) => setTimeout(resolve, 40));

  assert.equal(sendRequest(middleware, "192.0.2.3").continued, true);
});
