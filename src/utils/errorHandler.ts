import AppError from './AppError';

interface IHandler {
  logout: () => void;
}

const errorHandler = (error: AppError, { logout }: IHandler) => {
  if (error.statusCode === 401) {
    logout();
  }

  if (process.env.NODE_ENV === 'development') {
    throw new Error(error.message);
  }
};

export default errorHandler;
