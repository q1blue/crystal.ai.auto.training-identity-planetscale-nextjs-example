import Image from 'next/image';
import '../styles/loading.css';

export default function Loading() {
  return (
    <div className='loading__container'>
      <Image
        src='/logo-netlify-monogram-monochrome-darkmode.svg'
        width='120'
        height='106'
        alt='Loading...'
        style={{ margin: '0 auto 2rem' }}
        className='loading'
      />
    </div>
  );
}
