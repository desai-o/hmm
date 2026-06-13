const jwt = require("jsonwebtoken");

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    req.user = {
      id: "anonymous",
      role: "anonymous",
      name: "Anonymous"
    };
    return next();
  }

  try {
    const token = header.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email
    };

    return next();
  } catch (error) {
    req.user = {
      id: "anonymous",
      role: "anonymous",
      name: "Anonymous"
    };

    return next();
  }
}

function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user || req.user.id === "anonymous") {
      return res.status(401).json({
        error: "Authentication required"
      });
    }

    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions"
      });
    }

    next();
  };
}

module.exports = {
  optionalAuth,
  requireAuth,
  requireRole
};
