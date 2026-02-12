import express from 'express';
import authRoutes from '../modules/auth/routes/auth.routes';
import userRoutes from '../modules/user/routes/user.routes';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello World!' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
