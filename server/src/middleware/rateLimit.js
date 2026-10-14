const MAX_TRACKED_CLIENTS = 50000;

const rateLimit = ({
  windowMs,
  max,
  message,
  skipSuccessfulRequests = false,
}) => {
  const clients = new Map();

  const cleanup = setInterval(() => {
    const cutoff = Date.now();
    for (const [key, entry] of clients) {
      if (entry.resetAt <= cutoff) clients.delete(key);
    }
  }, windowMs);
  cleanup.unref();

  return (req, res, next) => {
    const now = Date.now();
    const clientId = req.ip || req.socket.remoteAddress || "unknown";
    let entry = clients.get(clientId);

    if (entry?.resetAt <= now) {
      clients.delete(clientId);
      entry = undefined;
    }

    if (!entry) {
      if (clients.size >= MAX_TRACKED_CLIENTS) {
        return res.status(503).json({
          success: false,
          message: "Too many active requests. Please try again later.",
        });
      }

      entry = { count: 0, resetAt: now + windowMs };
      clients.set(clientId, entry);
    }

    if (entry.count >= max) {
      const retryAfter = Math.max(
        1,
        Math.ceil((entry.resetAt - now) / 1000),
      );
      res.setHeader(
        "Retry-After",
        retryAfter,
      );
      return res.status(429).json({
        success: false,
        code: "RATE_LIMITED",
        message,
        retryAfter,
      });
    }

    entry.count += 1;

    if (skipSuccessfulRequests) {
      res.once("finish", () => {
        if (res.statusCode < 400) {
          entry.count -= 1;
          if (entry.count === 0 && clients.get(clientId) === entry) {
            clients.delete(clientId);
          }
        }
      });
    }

    next();
  };
};

export default rateLimit;
