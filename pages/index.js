import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import dynamic from 'next/dynamic'

const Waves = dynamic(
  () => import('./../components/waves'),
  { ssr: false }
)

export default function Home() {
  return (
    <>
      <Waves />

      {/* <div className="text"> */}
      {/*   <h2>Test</h2> */}
      {/*   <div> */}
      {/*     Adipisicing debitis iste quibusdam veritatis quos Sunt aliquid elit aut sed necessitatibus officiis! Quaerat perspiciatis doloremque impedit in doloribus suscipit. Itaque vitae incidunt eum in repudiandae Labore at modi nisi. */}
      {/*   </div> */}
      {/* </div> */}

    </>
  )
}
