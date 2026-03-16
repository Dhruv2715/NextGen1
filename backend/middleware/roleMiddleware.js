const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Not authenticated or role missing" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this route.` 
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
