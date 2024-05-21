import React from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from './Navbar'

export const Footer = () => {
  return (
    <div>
         <Navbar/>
        <section class="footer" id="footer">
        <div class="footer-box">
            <h2><span>E-</span>Furniture</h2>
            <p>E-Furniture is making furniture for ages and assuring product Quality. We believe in Quality and Comfort!</p>
            <div class="social">
                <Link to="https://www.facebook.com/mehtapralay/"><i class='bx bxl-facebook'></i></Link>
                <Link to="https://twitter.com/Pralay_mehta_14"><i class='bx bxl-twitter'></i></Link>
                <Link to="https://www.instagram.com/mehta_pralay_1_2_0_8/"><i class='bx bxl-instagram'></i></Link>
            </div>
        </div>
        <div class="footer-box">
            <h3>Services</h3>
            <li><Link to="shop">Product</Link></li>
            <li><Link to="contact">Help & Support</Link></li>
            <li><Link to="#">Pricing</Link></li>
            <li><Link to="#">FAQ</Link></li>
        </div>
        <div class="footer-box">
            <h3>Product</h3>
            <li><Link to="shop">Sofa's</Link></li>
            <li><Link to="shop">Chair's</Link></li>
            <li><Link to="#">Living Room</Link></li>
            <li><Link to="#">Office</Link></li>
        </div>
        <div class="footer-box contact-info">
            <h3>Contact</h3>
            <span>Ahemdabad , Gujarat</span>
            <span>+91 8347038378</span>
            <span>efurniture01@gmail.com</span>
            
        </div>
    </section>
    <div class="copyright">
        <p>&#169; @E-Furniture_2023. All Right Reserved.</p>
    </div>
    </div>
    
  )
}
