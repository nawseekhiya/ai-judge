// TODO: Cases route
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => res.status(501).json({ message: 'TODO: list cases' }));
router.post('/', (req, res) => res.status(501).json({ message: 'TODO: create case' }));

export default router;
