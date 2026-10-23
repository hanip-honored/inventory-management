import pool from '../config/database.js';

export async function createItem({
  name,
  description,
  stock,
  price,
}) {
  const result = await pool.query(
    `INSERT INTO items (name, description, stock, price)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, description, stock, price,
               created_at, updated_at`,
    [name, description, stock, price]
  );

  return result.rows[0];
}

export async function findItems({ search, limit, offset }) {
  const escapedSearch = search.replace(
    /[!%_]/g,
    (character) => `!${character}`
  );

  const pattern = `%${escapedSearch}%`;

  const whereClause = `WHERE (
    name ILIKE $1 ESCAPE '!'
    OR description ILIKE $1 ESCAPE '!'
  )`;

  const itemsResult = await pool.query(
    `SELECT id, name, description, stock, price,
            created_at, updated_at
     FROM items
     ${whereClause}
     ORDER BY id DESC
     LIMIT $2 OFFSET $3`,
    [pattern, limit, offset]
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total
     FROM items
     ${whereClause}`,
    [pattern]
  );

  return {
    items: itemsResult.rows,
    total: Number(countResult.rows[0].total),
  };
}

export async function updateItem(
  id,
  { name, description, stock, price }
) {
  const result = await pool.query(
    `UPDATE items
     SET name = $1,
         description = $2,
         stock = $3,
         price = $4,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING id, name, description, stock, price,
               created_at, updated_at`,
    [name, description, stock, price, id]
  );

  return result.rows[0] ?? null;
}

export async function deleteItem(id) {
  const result = await pool.query(
    `DELETE FROM items
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  return result.rows[0] ?? null;
}