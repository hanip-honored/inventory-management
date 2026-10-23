import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validateItem } from '../middlewares/validate-item.js';
import { validateItemQuery } from '../middlewares/validate-item-query.js';
import { validateItemId } from '../middlewares/validate-item-id.js';
import {
  create,
  list,
  update,
  remove,
} from '../controllers/item.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', validateItem, create);
router.get('/', validateItemQuery, list);
router.put('/:id', validateItemId, validateItem, update);
router.delete('/:id', validateItemId, remove);

export default router;