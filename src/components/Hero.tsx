import Image from 'next/image';
import React from 'react';
import '../styles/hero.css';

export default function Hero() {
  return (
    <article className='hero__header'>
      <Image
        src='/logo-netlify-small-monochrome-darkmode.svg'
        width='120'
        height='48'
        alt='Netlify logo'
        style={{ margin: '0 auto 2rem' }}
      />
      <h1 className='hero__header'>Identity + PlanetScale + Next.js</h1>
      <p className='hero__description'>
        This is a demo of Netlify Identity with PlanetScale and Next.js.
      </p>
      <button className='btn btn--ghost'>Deploy to Netlify</button>
      <button className='btn btn--ghost'>Source code</button>
    </article>
  );
}
