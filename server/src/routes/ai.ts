// TODO: AI route
import { Router } from 'express';

const router = Router();

router.post('/judge', (req, res) => {
  res.status(501).json({ message: 'TODO: AI judge route' });
});

export default router;
