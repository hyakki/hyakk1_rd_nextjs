import styles from './header.module.scss'

import Menu from './../menu/menu'

const header = () => {
  return (
    <header>

      <div className={styles.logo}>
        <svg className={styles.svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
          <path d="M32 0l-5.13 1.71v8.57a11.62 11.62 0 00-16 4c-.06.09-.09.18-.14.27l1.77-5.34a.11.11 0 000-.08l-.07-.05H7.31a.16.16 0 00-.08.06l-1.35 4.17a.11.11 0 000 .08.1.1 0 00.08 0h5l-5.75 1.98a.1.1 0 000 .06L0 31.44a.11.11 0 000 .08.09.09 0 00.07 0h5.19a.09.09 0 00.08-.06l4-12.42A11.64 11.64 0 0020.94 32c2.18 0 5-.73 6.36-2.06l4.7 1.5zM20.89 27.26a7 7 0 116.94-7 7 7 0 01-6.94 7z"/>
        </svg>
      </div>

      <Menu />

    </header>
  )
}

export default header;
