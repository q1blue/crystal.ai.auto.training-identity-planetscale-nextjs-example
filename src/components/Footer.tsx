import Image from 'next/image';
import {
  BsYoutube,
  BsTwitterX,
  BsLinkedin,
  BsChatLeftTextFill,
} from 'react-icons/bs';
import '../styles/footer.css';

export default function Footer() {
  return (
    <>
      <footer className='footer'>
        <section className='footer__body'>
          <a href='/'>
            <Image
              src='/logo-netlify-small-fullcolor-lightmode.svg'
              width='100'
              height='40'
              alt='Netlify logo'
            />
          </a>
          <div className='footer__socials'>
            <a href='https://youtube.com/Netlify'>
              <BsYoutube name='youtube' size={24} />
            </a>
            <a href='https://x.com/Netlify'>
              <BsTwitterX name='twitter' size={24} />
            </a>
            <a href='https://linkedin.com/company/Netlify'>
              <BsLinkedin name='linkedin' size={24} />
            </a>
            <a href='https://answers.netlify.com'>
              <BsChatLeftTextFill name='discourse' size={24} />
            </a>
          </div>
        </section>
        <section className='footer__body footer__legal'>
          <ul>
            <li>
              <a href='https://netlify.com/trust-center/'>Trust Center</a>
            </li>
            <li>
              <a href='https://netlify.com/privacy/'>Privacy</a>
            </li>
            <li>
              <a href='https://netlify.com/security/'>Security</a>
            </li>
            <li>
              <a href='https://netlify.com/gdpr-ccpa/'>GDPR/CCPA</a>
            </li>
            <li>
              <a href='mailto:fraud@netlify.com?subject=Abuse%20report&body=Please%20include%20the%20site%20URL%20and%20reason%20for%20your%20report%2C%20and%20we%20will%20reply%20promptly.'>
                Abuse
              </a>
            </li>
          </ul>
          <p className='copyright text--1'>
            © {new Date().getFullYear()} Netlify
          </p>
        </section>
      </footer>
    </>
  );
}
