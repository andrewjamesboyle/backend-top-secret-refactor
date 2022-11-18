const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const UserService = require('../services/UserService');

module.exports = Router()

  .post('/', async (req, res, next) => {
    try {
      const user = await UserService.create(req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  })

  .get('/me', [authenticate], async (req, res, next) => {
    try {
      res.json(req.user);
    } catch(e) {
      next(e);
    }
  });  
