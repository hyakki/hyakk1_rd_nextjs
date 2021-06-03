import styles from './mouse.module.scss'

const mouse = () => {
  return (
    <svg className={styles.mouse} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <polyline className={styles.one} points="13.3,18.6 16,21.4 18.7,18.6" />
      <polyline className={styles.two} points="13.3,21.6 16,24.4 18.7,21.6" />
      <polyline className={styles.three} points="13.3,24.6 16,27.4 18.7,24.6" />
      <path d="M16 1.3c-3 0-5.5 2.5-5.5 5.6v6.9c0 3.1 2.5 5.6 5.5 5.6s5.5-2.5 5.5-5.6V6.9c0-3.1-2.5-5.6-5.5-5.6z"/>
      <line x1="16" x2="16" y1="5.5" y2="7.5" />
    </svg>
  )
}

export default mouse
