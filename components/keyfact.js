import styles from './keyfact.module.scss'

import React, { useContext, useEffect, useRef } from 'react'
import SwipeContext from './../contexts/SwipeContext'

import gsap from 'gsap'

const keyfact = (props) => {
  const [swipe] = useContext(SwipeContext)
  const title = useRef(null)
  const text = useRef(null)
  const lines = useRef([])
  const linesInner = useRef([])

  useEffect(() => {
    init()

    return () => {
      destroy()
    }
  }, [])

  useEffect(() => {
    if (props.index === swipe) {
      gsap.to(linesInner.current,
        {
          delay: 0.3,
          duration: 0.2,
          yPercent: 0,
          ease: 'power4.out',
          stagger: {
            amount: 0.2,
          },
        },
      )

      gsap.to(text.current, {
        delay: 0.6,
        duration: 0.7,
        opacity: 1,
        xPercent: 20,
        ease: 'power4.out',
      })
    } else {
      gsap.set(linesInner.current, {
        delay: 0.2,
        yPercent: 100,
      })

      gsap.set(text.current, {
        delay: 0.2,
        opacity: 0,
        xPercent: 0,
      })
    }
  }, [swipe])

  const init = () => {
    linesInner.current = lines.current.map(l => l?.querySelector('span'))

    gsap.set(linesInner.current, {
      yPercent: '100',
    })

    gsap.set(text.current, {
      opacity: 0,
    })
  }

  const destroy = () => {
  }

  return (
    <div className={`${styles.keyfact} h-wrapper`}>
      <div className={styles.inner}>
        <h2 className={styles.title} ref={title}>
          {props.title.map(t => {
            return (
              <div key={`line-${t}`} ref={line => lines.current.push(line)}>
                <span dangerouslySetInnerHTML={{__html: t}}></span>
              </div>
            )
          })}
        </h2>
        <div className={styles.text} ref={text} dangerouslySetInnerHTML={{__html: props.text}}>
        </div>
      </div>
    </div>
  )
}

export default keyfact
