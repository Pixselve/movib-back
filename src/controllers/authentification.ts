const jwt = require('jsonwebtoken');
import User from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user: any
    }
  }
}

export const ensureToken = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'] || req.headers['x-access-token'];
  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, process.env.AUTH_TOKEN, async (err, result) => {
      if (err) {
        res.sendStatus(403);
      } else {
        const user = await User.findOne({username: result.username});
        if (!user) res.sendStatus(403);
        req.decoded = result;
        req.user = user;
        next();
      }
    });
  } else {
    res.sendStatus(403);
  }
};
