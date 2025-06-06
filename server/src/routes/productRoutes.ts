import { Router } from 'express';
import { productController } from '../controllers/productController';

const router = Router();

router.get('/search', productController.search);
router.get('/filters', productController.getFilters);

export default router; 