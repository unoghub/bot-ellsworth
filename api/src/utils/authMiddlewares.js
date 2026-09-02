export const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();

    res.send(401); // Unauthorized
};

export const checkAlreadyAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) return next();

    res.send(403); // Forbidden
};