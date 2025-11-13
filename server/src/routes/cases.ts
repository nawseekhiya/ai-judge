import { Router } from 'express';
import multer from 'multer';
import * as caseController from '../controllers/caseController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /cases — create case
router.post('/', caseController.createCase);

// GET /cases/:id — return case + args + latest verdicts
router.get('/:id', caseController.getCase);

// POST /cases/:id/uploads — upload file (multer) or accept raw text
router.post('/:id/uploads', upload.single('file'), caseController.uploadFile);

// POST /cases/:id/arg — post an argument (body: { side, text })
router.post('/:id/arg', caseController.addArgument);

export default router;
