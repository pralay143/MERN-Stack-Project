import React from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export const Shop = () => {
  return (
    <div>
         <Navbar/>
        <section class="shop" id="shop">
        <div class="heading">
            <h2>Shop Now</h2>
        </div>
        {/* <!-- Content --> */}
        <div class="shop-container">
            {/* <!-- Box 1 --> */}
            <div class="box">
                <div class="box-img">
                    <img src="images/p5.jpg" alt="sofa"/>
                </div>
                <div class="title-price">
                    <h3>Sofa</h3>
                    <div class="stars">
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                    </div>
                </div>
                
                
                <span>₹25500</span>
                <Link to='Cart' >
                <i class='bx bx-cart' > </i> </Link>
            </div>
            {/* <!-- Box 2 --> */}
            <div class="box">
                <div class="box-img">
                    <img src="images/p1.jpg" alt="sofa"/>
                </div>
                <div class="title-price">
                    <h3>Brown Chair</h3>
                    <div class="stars">
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star-half' ></i>
                    </div>
                </div>
                
                <span>₹25500</span><Link to='Cart' >
                <i class='bx bx-cart' > </i> </Link>
            </div>
            {/* <!-- Box 1 --> */}
            <div class="box">
                <div class="box-img">
                    <img src="images/img7.jpeg" alt="sofa"/>
                </div>
                <div class="title-price">
                    <h3>Julla</h3>
                    <div class="stars">
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                    </div>
                </div>
                
                <span>₹25500</span>
                <Link to='Cart' >
                <i class='bx bx-cart' > </i> </Link>
            </div>
            {/* <!-- Box 2 --> */}
            <div class="box">
                <div class="box-img">
                    <img src="images/img25.jpeg" alt="sofa"/>
                </div>
                <div class="title-price">
                    <h3>Dressing Table</h3>
                    <div class="stars">
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star-half' ></i>
                    </div>
                </div>
                
                <span>₹25500</span>
                <Link to='Cart' >
                <i class='bx bx-cart' > </i> </Link>
            </div>
            {/* <!-- Box 1 --> */}
            <div class="box">
                <div class="box-img">
                    <img src="images/img21.jpeg" alt="sofa"/>
                </div>
                <div class="title-price">
                    <h3>Bed</h3>
                    <div class="stars">
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                    </div>
                </div>
               
                <span>₹25500</span>
                <Link to='Cart' >
                <i class='bx bx-cart' > </i> </Link>
            </div>
            {/* <!-- Box 2 --> */}
            <div class="box">
                <div class="box-img">
                    <img src="images/img2.jpeg" alt="sofa"/>
                </div>
                <div class="title-price">
                    <h3>Big Jullla</h3>
                    <div class="stars">
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star-half' ></i>
                    </div>
                </div>
               
                <span>₹25500</span>
                <Link to='Cart' >
                <i class='bx bx-cart' > </i> </Link>
            </div>
            {/* <!-- Box 1 --> */}
            <div class="box">
                <div class="box-img">
                    <img src="images/img4.jpeg" alt="sofa"/>
                </div>
                <div class="title-price">
                    <h3>Julla</h3>
                    <div class="stars">
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                    </div>
                </div>
               
                <span>₹25500</span>
                <Link to='Cart' >
                <i class='bx bx-cart' > </i> </Link>
            </div>
            {/* <!-- Box 2 --> */}
            <div class="box">
                <div class="box-img">
                    <img src="images/img26.jpeg" alt="sofa"/>
                </div>
                <div class="title-price">
                    <h3>Dressing table</h3>
                    <div class="stars">
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star-half' ></i>
                    </div>
                </div>
                
                <span>₹25500</span>
                <Link to='Cart' >
                <i class='bx bx-cart' > </i> </Link>
            </div>
            <div class="box">
                <div class="box-img">
                    <img src="images/img12.jpeg" alt="sofa"/>
                </div>
                <div class="title-price">
                    <h3>Brown Sofa</h3>
                    <div class="stars">
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star-half' ></i>
                    </div>
                </div>
               
                <span>₹25500</span>
                <Link to='Cart' >
                <i class='bx bx-cart' > </i> </Link>
            </div>
            <div class="box">
                <div class="box-img">
                    <img src="images/img8.jpeg" alt="sofa"/>
                </div>
                <div class="title-price">
                    <h3>Three Julla</h3>
                    <div class="stars">
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star-half' ></i>
                    </div>
                </div>
             
                <span>₹25500</span>
                <Link to='Cart' >
                <i class='bx bx-cart' > </i> </Link>
            </div>
            <div class="box">
                <div class="box-img">
                    <img src="images/img9.jpeg" alt="sofa"/>
                </div>
                <div class="title-price">
                    <h3>Black Bed</h3>
                    <div class="stars">
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star-half' ></i>
                    </div>
                </div>
                
                <span>₹25500</span>
                <Link to='Cart' >
                <i class='bx bx-cart' > </i> </Link>
            </div>
            <div class="box">
                <div class="box-img">
                    <img src="images/img30.jpeg" alt="sofa"/>
                </div>
                <div class="title-price">
                    <h3>Brown</h3>
                    <div class="stars">
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star' ></i>
                        <i class='bx bxs-star-half' ></i>
                    </div>
                </div>
                
                <span>₹25500</span>
                <Link to='Cart' >
                <i class='bx bx-cart' > </i> </Link>
            </div>
            
        </div>
    </section>

    </div>
  )
}
