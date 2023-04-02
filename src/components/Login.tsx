import React from 'react';
import axios from 'axios';
import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import styles from './Login.module.scss';
import AppError from '../utils/AppError';
import { ICurrentUser } from '../context/AuthContext';

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
      <Form method="post">
        <div className={styles.app}>
          <div className={styles['login-form']}>
            <div className={styles.title}>Sign In</div>
            {data?.status === 'failed' && (
              <span className={styles.error}>{data.error}</span>
            )}
            <div className={styles.form}>
              <div className={styles['input-container']}>
                <label>Username </label>
                <input type="text" name="email" required />
              </div>
              <div className={styles['input-container']}>
                <label>Password </label>
                <input type="password" name="password" required />
              </div>
              <div className={styles['button-container']}>
                <input
                  type="submit"
                  disabled={isSubmitting}
                  value={isSubmitting ? 'Submitting...' : 'Login'}
                />
              </div>
            </div>
          </div>
        </div>
      </Form>
    </>
  );
};

export default Login;
