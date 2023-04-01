import React from 'react';
import axios from 'axios';
import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import styles from './Login.module.scss';
import AppError from '../utils/AppError';
import { ICurrentUser } from '../context/AuthContext';

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
        const { name, email, _id: id } = data.user;
        login({ id, email, name });
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
      <Form method="post">
        <div className={styles.app}>
          <div className={styles['login-form']}>
            <div className={styles.title}>User registration</div>
            {data?.status === 'failed' && (
              <span className={styles.error}>{data.error}</span>
            )}
            <div className={styles.form}>
              <div className={styles['input-container']}>
                <label>Username </label>
                <input type="text" name="name" required />
              </div>
              <div className={styles['input-container']}>
                <label>Email </label>
                <input type="text" name="email" required />
              </div>
              <div className={styles['input-container']}>
                <label>Password </label>
                <input type="password" name="password" required />
              </div>
              <div className={styles['input-container']}>
                <label>Password Confirmation </label>
                <input type="password" name="passwordConfirm" required />
              </div>
              <div className={styles['button-container']}>
                <input
                  type="submit"
                  disabled={isSubmitting}
                  value={isSubmitting ? 'Submitting...' : 'Signup'}
                />
              </div>
            </div>
          </div>
        </div>
      </Form>
    </>
  );
};

export default Signup;
