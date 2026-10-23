import {
  addItem,
  listItems,
  editItem,
  removeItem,
} from '../services/item.service.js';

export async function create(req, res) {
  const item = await addItem(req.body);

  return res.status(201).json({
    message: 'Barang berhasil ditambahkan',
    data: item,
  });
}

export async function list(req, res) {
  const result = await listItems(req.validatedQuery);

  return res.status(200).json({
    message: 'Daftar barang berhasil diambil',
    data: result.items,
    pagination: result.pagination,
  });
}

export async function update(req, res) {
  const item = await editItem(req.itemId, req.body);

  return res.status(200).json({
    message: 'Barang berhasil diperbarui',
    data: item,
  });
}

export async function remove(req, res) {
  await removeItem(req.itemId);

  return res.status(204).end();
}