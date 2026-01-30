import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getActiveSessions,
} from '../controllers/auth.controller';
import { userRegisterSchema } from '../validation/Auth.validation';
import { validate } from '../../../common/middlewares/index';
import { userLoginSchema } from '../validation/Auth.validation';

const router = express.Router();

router.post('/register', validate({ body: userRegisterSchema }), register);
router.post('/login', validate({ body: userLoginSchema }), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.get('/sessions', getActiveSessions);

export default router;
