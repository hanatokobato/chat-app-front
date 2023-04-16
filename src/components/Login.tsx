import React from 'react';
import axios from 'axios';
import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import styles from './Login.module.scss';
import AppError from '../utils/AppError';
import { ICurrentUser } from '../context/AuthContext';
import Header from './Header';

export const action = ({
  login,
}: {
  login: (user: ICurrentUser) => void;
}) => async ({ request }: any) => {
  try {
    const formData = await request.formData();
    const payload = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    const response: any = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/v1/login`,
      payload
    );

    if (response.data.status === 'success') {
      const user = response.data.data.user;
      login({ id: user._id, email: user.email, name: user.name });
      return redirect('/');
    } else {
      return {
        status: 'failed',
        error: 'Invalid email or password.',
      };
    }
  } catch (e: any) {
    throw new AppError(e, 401);
  }
};

const Login = () => {
  const data: any = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <>
      <Header />
      <main className={styles.main}>
        <Form
          className={`${styles.form} ${styles['login-form']}`}
          method="post"
        >
          <h2
            className={`${styles['heading-secondary']} ${styles['ma-bt-lg']}`}
          >
            Log into your account
          </h2>
          {data?.status === 'failed' && (
            <span className={styles.error}>{data.error}</span>
          )}
          <div className={styles['form__group']}>
            <label htmlFor="email" className={styles['form__label']}>
              Username{' '}
            </label>
            <input
              id="email"
              type="text"
              name="email"
              required
              className={styles['form__input']}
            />
          </div>
          <div className={styles['form__group']}>
            <label htmlFor="password" className={styles['form__label']}>
              Password{' '}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              className={styles['form__input']}
            />
          </div>
          <div className={styles['form__group']}>
            <button
              className="btn btn--primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Login'}
            </button>
          </div>
        </Form>
      </main>
    </>
  );
};

export default Login;
