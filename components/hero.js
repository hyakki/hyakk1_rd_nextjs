import styles from './hero.module.scss'

import Logo from './logo/logo'
import Mouse from './mouse'

const hero = () => {
  return (
    <div className={styles.hero}>
      <div className={styles.logo}>
        <Logo />
      </div>
      <div className={styles.scroll}>
        <Mouse />
      </div>
    </div>
  )
}

export default hero
