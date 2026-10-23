import {
  createItem,
  findItems,
  updateItem,
  deleteItem,
} from '../repositories/item.repository.js';
import AppError from '../utils/app-error.js';

export async function addItem(data) {
  return createItem(data);
}

export async function listItems({ search, page, limit }) {
  const offset = (page - 1) * limit;

  const { items, total } = await findItems({
    search,
    limit,
    offset,
  });

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function editItem(id, data) {
  const item = await updateItem(id, data);

  if (!item) {
    throw new AppError('Barang tidak ditemukan', 404);
  }

  return item;
}

export async function removeItem(id) {
  const item = await deleteItem(id);

  if (!item) {
    throw new AppError('Barang tidak ditemukan', 404);
  }

  return item;
}