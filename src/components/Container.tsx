'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/authContext';
import Loading from './Loading';
import '../styles/container.css';

export default function Container({ children }: { children: React.ReactNode }) {
  const { user, login, logout, loading, deleteAccount } =
    useContext(AuthContext);

  return (
    <div className='demo__container'>
      {loading ? (
        <Loading />
      ) : user ? (
        <>
          {children}
          <div className='demo__logout'>
            <button className='btn btn--secondary' onClick={logout}>
              Log out
            </button>
            <button className='btn btn--danger' onClick={deleteAccount}>
              Delete your login and data
            </button>
          </div>
        </>
      ) : (
        <div className='demo__login'>
          <div className='demo__login__content'>
            <p>To try out this demo, register and log in! </p>
            <p>You can delete your data again afterwards ✨</p>
            <button className='btn btn--secondary' onClick={login}>
              Log in / Register
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
