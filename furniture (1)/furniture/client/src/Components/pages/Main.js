import React from 'react'
import { Navbar } from '../Navbar'
import { Home } from '../Home'
import { Shop } from '../Shop'
import { Content } from '../Content'
import { About } from '../About'
import { Footer } from '../Footer'

export const Main = () => {
    return (
        <div>
            <Navbar />
            <Home />
            <Shop />
            <Content />
            <About />
            <Footer />
        </div>
    )
}
