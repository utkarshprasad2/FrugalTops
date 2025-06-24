import express, { Request, Response, NextFunction } from 'express';
import { ProductModel as Product } from '../models/Product';
// Assume requireAdmin middleware exists and is imported
// import { requireAdmin } from '../middleware/auth';

const router = express.Router();

// Dummy admin middleware for demonstration
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // In real app, check req.user.isAdmin
  if (req.headers['x-admin'] === 'true') return next();
  return res.status(403).json({ success: false, error: 'Admin access required' });
};

// Add a new product
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// Update a product
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// Delete a product
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router; 