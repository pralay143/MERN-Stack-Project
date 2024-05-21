import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import '../css/product.css'

export const Product = () => {
    const [user, setuser] = useState('')

    const getLoggedinUserData = () => {
        var id = localStorage.getItem("_id")
        axios.get("http://localhost:3550/user/user/" + id).then((res) => {
            console.log(res.data.data)
            setuser(res.data.data)
        }).catch((err) => {
            console.log(err)
        })
    }
    useEffect(() => {

        getLoggedinUserData()

    }, [])
    return (
        <div className='pro'>
            <Helmet>
                <link rel="apple-touch-icon" sizes="76x76" href="./assets/img/apple-icon.png" />
                <link rel="icon" type="image/png" href="./assets/img/favicon.png" />




                <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,900|Roboto+Slab:400,700" />

                <link href="./assets/css/nucleo-icons.css" rel="stylesheet" />
                <link href="./assets/css/nucleo-svg.css" rel="stylesheet" />

                <script src="https://kit.fontawesome.com/42d5adcbca.js" crossorigin="anonymous"></script>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
                <link id="pagestyle" href="./assets/css/material-dashboard.css?v=3.0.4" rel="stylesheet" />

            </Helmet>
            <aside className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 bg-gradient-dark" id="sidenav-main">
                <div className="sidenav-header">
                    <i className="fas fa-times p-3 cursor-pointer text-white opacity-5 position-absolute end-0 top-0 d-none d-xl-none" aria-hidden="true" id="iconSidenav"></i>
                    <Link className="navbar-brand m-0" to=" https://demos.creative-tim.com/material-dashboard/pages/dashboard " target="_blank">
                        <span className="fs-3 font-weight-bold text-white">{user.name}</span
                        >
                    </Link>
                </div>

                <hr className="horizontal light mt-0 mb-2" />

                <div className="collapse navbar-collapse w-auto" id="sidenav-collapse-main">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/Vendordashboard">
                                <div
                                    className="text-white text-center me-2 d-flex align-items-center justify-content-center"
                                >
                                    <i className="material-icons opacity-10">dashboard</i>
                                </div>

                                <span className="nav-link-text ms-1">Dashboard</span>
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/Product">
                                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                    <span class='material-icons'>chair</span>
                                </div>

                                <span className="nav-link-text ms-1">Product</span>
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link text-white" to="./tables.html">
                                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                    <i className="material-icons opacity-10">table_view</i>
                                </div>

                                <span className="nav-link-text ms-1">Tables</span>
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link text-white" to="./billing.html">
                                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                    <i className="material-icons opacity-10">receipt_long</i>
                                </div>

                                <span className="nav-link-text ms-1">Billing</span>
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link text-white" to="./virtual-reality.html">
                                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                    <i className="material-icons opacity-10">view_in_ar</i>
                                </div>

                                <span className="nav-link-text ms-1">Virtual Reality</span>
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link text-white" to="./rtl.html">
                                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                    <i className="material-icons opacity-10">format_textdirection_r_to_l</i
                                    >
                                </div>

                                <span className="nav-link-text ms-1">RTL</span>
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link text-white" to="./notifications.html">
                                <div
                                    className="text-white text-center me-2 d-flex align-items-center justify-content-center"
                                >
                                    <i className="material-icons opacity-10">notifications</i>
                                </div>

                                <span className="nav-link-text ms-1">Notifications</span>
                            </Link>
                        </li>

                        <li className="nav-item mt-3">
                            <h6 className="ps-4 ms-2 text-uppercase text-xs text-white font-weight-bolder opacity-8">
                                Account pages
                            </h6>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/Profile">
                                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                    <i className="material-icons opacity-10">person</i>
                                </div>

                                <span className="nav-link-text ms-1">Profile</span>
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/  ">
                                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                    <span class="material-icons">logout</span>
                                </div>

                                <span className="nav-link-text ms-1">LogOut</span>
                            </Link>
                        </li>


                    </ul>
                </div>


            </aside>
            <div className='prto'>
                Product
            </div>
     <div  className='buttonn'>
            <a href="/Additems" class="button">Add Item</a>
            </div>

            <div class="cardd">
                <div class="card-image"></div>
                <div class="category"> Illustration </div>
                <div class="heading"> A heading that must span over two lines
                    <div class="author"> By <span class="name">Abi</span> 4 days ago</div>
                </div>
            </div>
        </div>
    )
}
