import styles from './hero.module.scss'

import Logo from './logo/logo'

const hero = () => {
  return (
    <div className={styles.hero}>
      <div className={styles.logo}>
        <Logo />
      </div>
    </div>
  )
}

export default hero
