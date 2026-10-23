import AppError from '../utils/app-error.js';

export default function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'Body JSON tidak valid',
    });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      message: 'Body request terlalu besar',
    });
  }

  console.error(error);

  return res.status(500).json({
    message: 'Terjadi kesalahan pada server',
  });
}