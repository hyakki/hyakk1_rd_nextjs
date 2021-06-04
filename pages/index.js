import Head from 'next/head'
import Image from 'next/image'

import Keyfact from './../components/keyfact'
import Hero from './../components/hero'
import dynamic from 'next/dynamic'
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y, Mousewheel } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import React, {useContext, useState} from 'react'

SwiperCore.use([Mousewheel, Pagination])

import SwipeContext from './../contexts/SwipeContext'
import SwipperContext from './../contexts/SwipperContext'
import contents from './../components/contents'
import Header from './../components/header/header'
import Mouse from './../components/mouse'

const Waves = dynamic(
  () => import('./../components/waves'),
  { ssr: false }
)

const Sea = dynamic(
  () => import('./../components/sea/sea'),
  { ssr: false }
)

export default function Home() {
  const swipeState = useState(0)
  const [swipe, setSwipe] = swipeState

  const swipperState = useState(null)
  const [swipper, setSwipper] = swipperState

  return (
    <>
      <SwipperContext.Provider value={swipperState}>
        <SwipeContext.Provider value={swipeState}>

          <Header />

          <Mouse />

          <main>
            <Sea />


            <Swiper direction={'vertical'}
                    slidesPerView={1}
                    spaceBetween={30}
                    mousewheel={true}
                    followFinger={false}
                    simulateTouch={false}
                    onInit={swiper => {
                      setSwipper(swiper)
                    }}
                    onSlideChange={swiper => setSwipe(swiper.activeIndex)}
                    pagination={{
                      clickable: true,
                      renderBullet: (index, className) => {
                        return (
                          `
                          <span class="${className}">
                            ${index + 1}
                          </span>
                          `
                        )
                      }
                    }}
                    className="mySwiper">
              <SwiperSlide>
                <Hero />
              </SwiperSlide>

              {contents.map((c, i) => {
                return (
                  <SwiperSlide key={`content-${i}`}>
                    <Keyfact index={i + 1} title={c.title} text={c.text}  />
                  </SwiperSlide>
                )
              })}

              <SwiperSlide>
                <h2 style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 80, fontWeight: 200, margin: 0 }}>
                  Clients
                </h2>
              </SwiperSlide>

              <SwiperSlide>
                <h2 style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 80, fontWeight: 200, margin: 0 }}>
                  Contact
                </h2>
              </SwiperSlide>

            </Swiper>
          </main>

        </SwipeContext.Provider>
      </SwipperContext.Provider>

    </>
  )
}
