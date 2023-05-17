import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Account.module.scss';
import { useForm, Resolver } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import AppError from './../utils/AppError';
import axios from 'axios';

type FormValues = {
  name: string;
  photo: File;
};

const resolver: Resolver<FormValues> = async (values) => {
  return {
    values: values.name ? values : {},
    errors: !values.name
      ? {
          name: {
            type: 'required',
            message: 'This is required.',
          },
        }
      : {},
  };
};

const Account = () => {
  const { currentUser, setUserAttr } = useContext(AuthContext);
  if (!currentUser) throw new AppError('Please log in.', 401);

  const [image, setImage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver,
    defaultValues: {
      name: currentUser.name,
    },
  });

  const onImageChange = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  const submitHandler = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('photo', data.photo[0]);

      const response: any = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/users/${currentUser.id}`,
        formData
      );
      if (response.data.status === 'success') {
        setUserAttr('photo', response.data.data.user.photoUrl);
        setUserAttr('name', response.data.data.user.name);
        setErrorMessage(undefined);
      }
    } catch (e: any) {
      if (e.response?.data?.status === 'error') {
        setErrorMessage(e.response.data.message);
      }
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles['user-view']}>
        <nav className={styles['user-view__menu']}>
          <ul className={styles['side-nav']}>
            <li
              className={`${styles['side-nav__item']} ${styles['side-nav__item--active']}`}
            >
              <Link className={styles['side-nav__link']} to="#">
                Settings
              </Link>
            </li>
            <li className={`${styles['side-nav__item']}`}>
              <Link className={styles['side-nav__link']} to="/rooms">
                Chat
              </Link>
            </li>
          </ul>
        </nav>
        <div className={styles['user-view__content']}>
          <div className={styles['user-view__form-container']}>
            {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            )}
            <h2
              className={`${styles['heading-secondary']} ${styles['ma-bt-md']}`}
            >
              Your account settings
            </h2>

            <form
              onSubmit={handleSubmit(submitHandler)}
              className={`${styles.form} ${styles['form-user-data']}`}
            >
              <div className={styles.form__group}>
                <label className={styles.form__label} htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  className={styles.form__input}
                  {...register('name')}
                />
                {errors?.name && <p>{errors.name.message}</p>}
              </div>
              <div
                className={`${styles.form__group} ${styles['form__photo-upload']}`}
              >
                {(currentUser.photo || image) && (
                  <img
                    className={styles['form__user-photo']}
                    src={image ? image : currentUser.photo}
                    alt="User"
                  />
                )}
                <input
                  {...register('photo')}
                  className={styles.form__upload}
                  type="file"
                  id="photo"
                  onChange={onImageChange}
                />
                <label htmlFor="photo">Choose new photo</label>
              </div>
              <div className={`${styles.form__group} ${styles.right}`}>
                <button className="btn btn--primary btn--small">
                  Save settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
