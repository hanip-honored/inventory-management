# Inventory Management API

REST API sederhana untuk mengelola inventaris barang. Pengguna dapat membuat akun, login, serta menambah, mencari, mengubah, dan menghapus barang setelah login.

Inventaris digunakan bersama. Semua pengguna yang sudah login dapat mengelola barang yang sama.

## Teknologi

- Node.js dan Express
- PostgreSQL
- node-postgres (`pg`) untuk mengakses database
- Zod untuk validasi input
- Argon2id untuk hash password
- JSON Web Token (JWT) untuk autentikasi

Saya menggunakan SQL langsung melalui `pg` karena kebutuhan query pada project ini masih sederhana. Dengan cara ini, query dan aturan perubahan data dapat dilihat dengan jelas di repository.

## Menjalankan project secara lokal

Langkah berikut digunakan untuk menyiapkan project setelah repository di-clone.

### 1. Install dependency

Pastikan Node.js 24 dan PostgreSQL sudah tersedia, lalu jalankan dari folder project:

```bash
npm ci
```

### 2. Siapkan database

Buat database bernama `inventory_management`. Jika menggunakan DBeaver, buka SQL Editor pada koneksi PostgreSQL lalu jalankan:

```sql
CREATE DATABASE inventory_management;
```

Setelah itu, hubungkan SQL Editor ke database `inventory_management` dan jalankan isi file berikut secara berurutan:

1. `database/001_create_users.sql`
2. `database/002_create_items.sql`

File tersebut membuat tabel `users` dan `items`. Jalankan pada database baru yang belum memiliki kedua tabel tersebut.

### 3. Atur environment variable

Salin `.env.example` menjadi `.env`. Contoh menggunakan PowerShell:

```powershell
Copy-Item .env.example .env
```

Sesuaikan konfigurasi koneksi PostgreSQL:

```dotenv
PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=inventory_management
PGUSER=postgres
PGPASSWORD=
JWT_SECRET=
```

Isi `PGUSER` dan `PGPASSWORD` sesuai akun PostgreSQL yang digunakan.

Untuk membuat nilai `JWT_SECRET`, jalankan:

```bash
node --input-type=module -e "import { randomBytes } from 'node:crypto'; console.log(randomBytes(32).toString('hex'));"
```

Salin hasilnya ke `JWT_SECRET` pada `.env`. File `.env` tidak disertakan dalam repository.

### 4. Jalankan aplikasi

```bash
npm run dev
```

Untuk menjalankan tanpa perubahan file:

```bash
npm start
```

Secara default, API berjalan di `http://localhost:3000`.

## Endpoint

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/auth/register` | Membuat akun |
| POST | `/auth/login` | Login dan mendapatkan JWT |
| POST | `/items` | Menambahkan barang |
| GET | `/items` | Menampilkan, mencari, dan membagi daftar barang per halaman |
| PUT | `/items/:id` | Mengubah data barang |
| DELETE | `/items/:id` | Menghapus barang |

Seluruh endpoint `/items` membutuhkan header:

```http
Authorization: Bearer <accessToken>
```

Token berlaku selama 3.600 detik atau satu jam.

Contoh pencarian dan pagination:

```http
GET /items?search=keyboard&page=1&limit=10
```

Pencarian dilakukan pada nama dan deskripsi barang tanpa membedakan huruf besar dan kecil. Nilai default `page` adalah `1`, sedangkan `limit` adalah `10` dengan batas maksimal `100`.

## Aturan input barang

- `name` wajib diisi, maksimal 150 karakter.
- `description` bersifat opsional, maksimal 2.000 karakter. Jika tidak dikirim, nilainya menjadi string kosong.
- `stock` wajib berupa bilangan bulat dari 0 sampai 2147483647.
- `price` wajib bernilai 0 sampai 9999999999.99, dengan maksimal dua angka desimal.

Harga disimpan menggunakan tipe `NUMERIC(12, 2)`. Pada respons API, harga dikembalikan sebagai string desimal untuk menjaga ketepatan nilainya.

Endpoint `PUT` menerima seluruh field wajib. Jika `description` tidak dikirim saat update, deskripsi akan menjadi string kosong.

## Dokumentasi API

Contoh request tersedia pada [Postman Collection](./Inventory%20Management%20API.postman_collection.json).

Import file tersebut ke Postman. Collection menggunakan variabel berikut:

- `baseUrl`: alamat API, secara default `http://localhost:3000`.
- `accessToken`: diisi otomatis setelah login berhasil.
- `itemId`: diisi otomatis setelah barang berhasil dibuat.

Urutan penggunaan:

```text
Register → Login → Create Item → List Items → Update Item → Delete Item
```

Jika akun sudah terdaftar, langsung mulai dari Login menggunakan akun tersebut.

## Jawaban pertanyaan pemahaman

### 1. Bagaimana alur request sampai data tersimpan?

Sebagai contoh, ketika pengguna mengirim `POST /items`, request melewati alur berikut:

```text
Client
  → Router
  → Middleware autentikasi
  → Middleware validasi
  → Controller
  → Service
  → Repository
  → PostgreSQL
```

Router menentukan handler berdasarkan URL dan method request.

Middleware autentikasi memeriksa JWT. Setelah itu, middleware validasi memeriksa body request, misalnya memastikan nama terisi dan stok tidak negatif.

Controller mengambil input yang sudah diperiksa, lalu memanggil service. Service menangani aturan aplikasi, sedangkan repository menjalankan query SQL menggunakan parameter.

Database juga memiliki constraint sebagai perlindungan tambahan. Contohnya, kolom stok memiliki `CHECK (stock >= 0)` dan email pengguna harus unik.

Jika penyimpanan berhasil, data dikembalikan ke controller untuk dikirim sebagai respons `201 Created`. Jika terjadi kesalahan, error diteruskan ke error handler agar bentuk respons tetap konsisten.

Saya memisahkan tanggung jawab ini supaya perubahan lebih mudah dilakukan. Misalnya, perubahan query cukup dikerjakan pada repository, sementara perubahan respons HTTP dilakukan pada controller. Pembagian ini juga memudahkan pengujian tiap bagian.

### 2. Sebaiknya JWT disimpan di Local Storage atau HttpOnly Cookie?

Untuk frontend berbasis browser, saya memilih HttpOnly Cookie yang diatur oleh server melalui header `Set-Cookie`.

Token di Local Storage dapat dibaca JavaScript. Jika aplikasi memiliki celah XSS, script berbahaya bisa mengambil token tersebut dan menggunakannya untuk mengakses API sebagai pengguna.

Cookie dengan atribut `HttpOnly` membatasi akses JavaScript terhadap isinya. Pada penggunaan HTTPS, atribut `Secure` juga diperlukan agar cookie dikirim melalui koneksi yang terenkripsi.

Namun, cookie dikirim otomatis oleh browser sehingga risiko CSRF tetap perlu ditangani. Saya akan menggunakan pengaturan `SameSite` yang sesuai dan perlindungan CSRF, misalnya CSRF token untuk request yang mengubah data.

HttpOnly juga tidak menyelesaikan seluruh risiko XSS. Script berbahaya yang berjalan di halaman masih dapat mencoba mengirim request menggunakan sesi pengguna.

Pada implementasi project ini, login mengembalikan JWT dalam respons JSON dan endpoint barang menerima Bearer token. Penggunaan HttpOnly Cookie merupakan pilihan untuk integrasi frontend browser yang memerlukan penyesuaian pada proses login dan middleware autentikasi.

### 3. Bagaimana mencegah stok negatif ketika dua request datang bersamaan?

Untuk operasi pengurangan stok, saya akan menggabungkan pemeriksaan dan pengurangan dalam satu query:

```sql
UPDATE items
SET stock = stock - $1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $2
  AND stock >= $1
RETURNING id, stock;
```

`$1` adalah jumlah yang dikurangi dan harus divalidasi sebagai bilangan bulat positif. `$2` adalah ID barang.

Misalnya stok tersisa 1 dan dua request masing-masing mengurangi 1. Request pertama mengubah stok menjadi 0. Request kedua menunggu perubahan pada baris tersebut, lalu PostgreSQL memeriksa kembali kondisi `stock >= 1`. Karena kondisinya sudah tidak terpenuhi, request kedua tidak mengurangi stok.

Jika query tidak mengembalikan baris, operasi gagal karena barang tidak ditemukan atau stok tidak mencukupi. Service perlu menangani kondisi tersebut.

Constraint `CHECK (stock >= 0)` tetap digunakan sebagai perlindungan tambahan.

Jika pengurangan stok berkaitan dengan pencatatan transaksi, keduanya dijalankan dalam satu transaksi database pada koneksi yang sama agar berhasil atau dibatalkan bersama.

Query di atas merupakan rancangan untuk operasi pengurangan stok. Endpoint `PUT /items/:id` pada project ini mengisi stok dengan nilai yang dikirim pengguna.