import React from 'react';
import axios from 'axios';
import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import styles from './Login.module.scss';
import AppError from '../utils/AppError';
import { ICurrentUser } from '../context/AuthContext';
import Header from './Header';

export const action =
  ({ login }: { login: (user: ICurrentUser) => void }) =>
  async ({ request }: any) => {
    try {
      const formData = await request.formData();
      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        passwordConfirm: formData.get('passwordConfirm'),
      };

      const response: any = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/signup`,
        payload
      );

      const { data, status } = response.data;
      if (status === 'success') {
        const { name, email, _id: id, photoUrl: photo } = data.user;
        login({ id, email, name, photo });
        return redirect('/');
      } else {
        return {
          status: 'failed',
          error: 'Invalid form data.',
        };
      }
    } catch (e: any) {
      if (e.response) throw new AppError(e.statusText, e.status);

      throw new AppError(e, 500);
    }
  };

const Signup = () => {
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
            Create new account
          </h2>
          {data?.status === 'failed' && (
            <span className={styles.error}>{data.error}</span>
          )}
          <div className={styles['form__group']}>
            <label htmlFor="name" className={styles['form__label']}>
              Username{' '}
            </label>
            <input
              id="name"
              type="text"
              name="name"
              required
              className={styles['form__input']}
            />
          </div>
          <div className={styles['form__group']}>
            <label htmlFor="email" className={styles['form__label']}>
              Email{' '}
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
            <label htmlFor="passwordConfirm" className={styles['form__label']}>
              Confirm your password{' '}
            </label>
            <input
              id="passwordConfirm"
              type="password"
              name="passwordConfirm"
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
              {isSubmitting ? 'Submitting...' : 'Register'}
            </button>
          </div>
        </Form>
      </main>
    </>
  );
};

export default Signup;
