import { redirect } from 'react-router-dom';

export const checkAuthLoader = () => {
  const currentUser = localStorage.getItem('user');

  if (!currentUser || currentUser === 'null' || currentUser === 'undefined') {
    return redirect('/login');
  } else {
    return true;
  }
};
