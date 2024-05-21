import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Navbar } from '../Navbar';

export const Cart = () => {

    var id = localStorage.getItem("_id");
    const [users, setusers] = useState("");
    const getLoggedinUserData = () => {
      axios
        .get("http://localhost:4000/user/get/" + id)
        .then((res) => {
          console.log(res.data.data);
          setusers(res.data.data);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    useEffect(() => {
      getLoggedinUserData();
    
      getApi();
    }, []);
    
    const [books, setbooks] = useState();
    const [loading, setLoading] = useState(true);
    const [totalprice, setTotalPrice] = useState();
    const [totalprices, setTotalPrices] = useState();
    var url = process.env.PUBLIC_URL + "/uploads/";
    console.log(url);
  
    const getApi = () => {
      axios
        .get("http://localhost:4000/cart/getproduct")
        .then((res) => {
          const filteredProducts = res.data.product.filter((product) => {
            return product.user._id === id;
          });
          console.log("......", filteredProducts)
          var subtotal = 0;
          for (let i = 0; i < filteredProducts.length; i++) {
            console.log(filteredProducts[i])
  
            subtotal = subtotal + filteredProducts[i].product.price * filteredProducts[i].qty;
  
          }
          setTotalPrices(subtotal)
  
  
  
  
  
  
  
          var total = 40;
          for (let i = 0; i < filteredProducts.length; i++) {
            console.log(filteredProducts[i])
  
            total = total + filteredProducts[i].product.price * filteredProducts[i].qty;
  
          }
          setTotalPrice(total)
          setbooks(filteredProducts);
        
          setLoading(false);
        })
  
  
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    };
    const deleteUser = (id) => {
  
      axios.delete("http://localhost:4000/cart/delete/" + id).then((res) => {
  
  
          getApi()
  
  
  
      }).catch((err) => {
  
          console.log(err)
      })
  }
  
    var style1={
        max_width: "120px"
    }
    var Style2={
        max_width: "120px"
    }
    return (
        <div>
            <Helmet>
                <link href="css/bootstrap.min.css" rel="stylesheet" />
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet" />
                <link href="css/tiny-slider.css" rel="stylesheet" />
                <link href="css/style.css" rel="stylesheet" />
                <script src="js/bootstrap.bundle.min.js"></script>
		        <script src="js/tiny-slider.js"></script>
		        <script src="js/custom.js"></script>
            </Helmet>
            <div>
                
                    <Navbar/>
                <div class="untree_co-section before-footer-section">
                    <div class="container">
                        <div class="row mb-5">
                            <form class="col-md-12" method="post">
                                <div class="site-blocks-table">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th class="product-thumbnail">Image</th>
                                                <th class="product-name">Product</th>
                                                <th class="product-price">Price</th>
                                                 <th class="product-quantity">Quantity</th>
                                                <th class="product-total">Total</th>
                                                <th class="product-remove">Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td class="product-thumbnail">
                                                    <img src="./images/p3.jpg" alt="Image" class="img-fluid" />
                                                </td>
                                                <td class="product-name">
                                                    <h2 class="h5 text-black">Product 1</h2>
                                                </td>
                                                <td>Rs 25500.00</td>
                                                <td>
                                                    <div class="input-group mb-3 d-flex align-items-center quantity-container" style={style1}>
                                                        <div class="input-group-prepend">
                                                            <button class="btn btn-outline-black decrease" type="button">-</button>
                                                        </div>
                                                        <input type="text" class="form-control text-center quantity-amount" value="1" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                                        <div class="input-group-append">
                                                            <button class="btn btn-outline-black increase" type="button">+</button>
                                                        </div>
                                                    </div>

                                                </td>
                                                <td>Rs 25500.00</td>
                                                <td><a href="#" class="btn btn-black btn-sm">X</a></td>
                                            </tr>

                                            <tr>
                                                <td class="product-thumbnail">
                                                    <img src="./images/img1.jpeg" alt="Image" class="img-fluid" />
                                                </td>
                                                <td class="product-name">
                                                    <h2 class="h5 text-black">Product 2</h2>
                                                </td>
                                                <td>Rs 25500.00</td>
                                                <td>
                                                    <div class="input-group mb-3 d-flex align-items-center quantity-container" style={Style2}>
                                                        <div class="input-group-prepend">
                                                            <button class="btn btn-outline-black decrease" type="button">−</button>
                                                        </div>
                                                        <input type="text" class="form-control text-center quantity-amount" value="1" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                                        <div class="input-group-append">
                                                            <button class="btn btn-outline-black increase" type="button">+</button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>Rs 25500.00</td>
                                                <td><a href="#" class="btn btn-black btn-sm">X</a></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </form>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="row mb-5">
                                    
                                    <div class="col-md-6">
                                        <button class="btn btn-outline-black btn-sm btn-block">Continue Shopping</button>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-12">
                                        <label class="text-black h4" for="coupon">Coupon</label>
                                        <p>Enter your coupon code if you have one.</p>
                                    </div>
                                    <div class="col-md-8 mb-3 mb-md-0">
                                        <input type="text" class="form-control py-3" id="coupon" placeholder="Coupon Code" />
                                    </div>
                                    <div class="col-md-4">
                                        <button class="btn btn-black">Apply Coupon</button>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6 pl-5">
                                <div class="row justify-content-end">
                                    <div class="col-md-7">
                                        <div class="row">
                                            <div class="col-md-12 text-right border-bottom mb-5">
                                                <h3 class="text-black h4 text-uppercase">Cart Totals</h3>
                                            </div>
                                        </div>
                                        <div class="row mb-3">
                                            <div class="col-md-6">
                                                <span class="text-black">Subtotal</span>
                                            </div>
                                            <div class="col-md-6 text-right">
                                                <strong class="text-black">Rs51,000.00</strong>
                                            </div>
                                        </div>
                                        <div class="row mb-5">
                                            <div class="col-md-6">
                                                <span class="text-black">Total</span>
                                            </div>
                                            <div class="col-md-6 text-right">
                                                <strong class="text-black">Rs51,000.00</strong>
                                            </div>
                                        </div>

                                        <div class="row">
                                            <div class="col-md-12">
                                                <button class="btn btn-black btn-lg py-3 btn-block" onclick="window.location='checkout.html'">Proceed To Checkout</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

