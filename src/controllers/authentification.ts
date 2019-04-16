const jwt = require('jsonwebtoken');

export const ensureToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'] || req.headers['x-access-token'];
  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, process.env.AUTH_TOKEN, (err, result) => {
      if (err) {
        res.sendStatus(403);
      } else {
        req.decoded = result;
        next();
      }
    });
  } else {
    res.sendStatus(403);
  }
};
