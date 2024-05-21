import React from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from './Navbar'

export const About = () => {
    return (
        <div>
             <Navbar/>
            <div><section class="about" id="about">
                <div class="about-img">
                    <img src="images/p3.jpg" alt="about" />
                </div>
                <div class="about-text">
                    <span>About Us</span>
                    <h2>Furniture is important part for Comfort</h2>
                    <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eveniet, placeat praesentium. Quas quis, omnis repellendus reiciendis eius fuga quidem eum illum veniam explicabo excepturi fugit distinctio sequi quisquam quaerat dignissimos! Beatae delectus numquam perspiciatis.</p>
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Modi ex aut repellat ipsum possimus delectus cum quaerat rerum.</p>
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Modi ex aut repellat ipsum possimus delectus cum quaerat rerum.</p>

                    <a href="#shop" class="btnn">Learn More.</a>
                </div>
            </section></div>
        </div>
    )
}
