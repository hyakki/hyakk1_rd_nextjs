import styles from './menu.module.scss'
import contents from './../contents'

import React, { useContext, useEffect, useState, useRef } from 'react'
import SwipperContext from './../../contexts/SwipperContext'

import gsap from 'gsap'

const menu = () => {
  const [swipper] = useContext(SwipperContext)
  const [isOpen, setOpen] = useState(false)

  const rContent = useRef(null)
  const rTrigger = useRef(null)
  const rOverlay = useRef(null)
  const rBg = useRef(null)
  const rList = useRef(null)

  let tl

  console.log(rContent.current, rTrigger.current, rOverlay.current, rBg.current, rList.current)

  const createTimeline = () => {
    tl = gsap.timeline({ paused: true })

    tl.add(() => {
      if (tl.reversed()) {
        gsap.set(rContent.current, {
          display: 'none',
        })
      } else {
        gsap.set(rContent.current, {
          display: 'flex',
        })
      }
    })

    tl.fromTo(rOverlay.current, {
      duration: 1,
      opacity: 0,
    }, {
      opacity: 1,
      ease: 'power4.out',
    }, '#start')

    tl.from(rBg.current, {
      duration: 1,
      xPercent: '+=100%',
      ease: 'power4.out',
    }, '#start')

    if (tl.reversed()) {
      tl.add(() => {
        gsap.set(rContent.current, {
          display: 'flex',
        })
      })
    }
  }

  // createTimeline()

  const open = () => {
    rContent.current.classList.add(styles.isOpen)
    rTrigger.current.classList.add(styles.isActive)

    setOpen(true)

//     tl.play()
  }

  const close = () => {
    rContent.current.classList.remove(styles.isOpen)
    rTrigger.current.classList.remove(styles.isActive)

    setOpen(false)

    // tl.timeScale(2)
    // tl && tl.reverse()
  }

  const toggle = () => {
    isOpen ? close() : open()
  }

  const goTo = n => {
    swipper.slideTo(n)
    close()
  }

  return (
    <>
      <svg className={styles.trigger}
           xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 32 32"
           ref={rTrigger}
           onClick={toggle}>
        <path className={styles.triggerTop} d="M5 12h22v1H5z"></path>
        <path className={styles.triggerBottom} d="M5 18h22v1H5z"></path>
      </svg>


      <div className={styles.content} ref={rContent}>
        <div className={styles.overlay} onClick={close} ref={rOverlay}></div>
        <div className={styles.inner}>
          <div className={styles.bg} ref={rBg}></div>
          <ul className={styles.list} ref={rList}>
            {contents.map((c, i) => {
              return (
                <li key={`content-${i}`} className={styles.item} onClick={() => goTo(i + 1) }>
                  { c.menu }
                </li>
              )
            })}
            <li className={styles.item} onClick={() => goTo(contents.length + 1)}>
              Our clients
            </li>
            <li className={styles.item} onClick={() => goTo(contents.length + 2)}>
              Contact
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}

export default menu;
