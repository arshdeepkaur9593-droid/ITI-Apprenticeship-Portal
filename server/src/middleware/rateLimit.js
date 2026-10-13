const MAX_TRACKED_CLIENTS = 50000;

const rateLimit = ({ windowMs, max, message }) => {
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

    if (!entry || entry.resetAt <= now) {
      if (!entry && clients.size >= MAX_TRACKED_CLIENTS) {
        return res.status(503).json({
          success: false,
          message: "Too many active requests. Please try again later.",
        });
      }

      entry = { count: 0, resetAt: now + windowMs };
      clients.set(clientId, entry);
    }

    entry.count += 1;
    if (entry.count > max) {
      res.setHeader(
        "Retry-After",
        Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
      );
      return res.status(429).json({ success: false, message });
    }

    next();
  };
};

export default rateLimit;
