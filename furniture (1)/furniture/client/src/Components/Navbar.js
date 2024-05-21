import React from 'react'
import { Link } from 'react-router-dom'

export const Navbar = () => {
  return (
    <div>
        <header>
        <Link to="#" class="logo"><span>E-</span>Furniture</Link>
        <div class="bx bx-menu" id="menu-icon"></div>
 
        <ul class="navbar">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/"><select>
   <option  > <strong> Category</strong></option>
   <option value="saab">Bad</option>
   <option value="mercedes">Sofa</option>
   <option value="audi">Chair</option>
   <option value="mercedes">Dinning Set</option>
   <option value="audi">Tables</option>
   <option value="mercedes">Dressboard</option>
   <option value="audi">Arm Chair</option>
</select> </Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/Contact">Contact</Link></li>
            <li><Link to="/Login">Login</Link></li>
          <li><Link to="/Cart"><img src='/cart3.svg' width={"25px"}></img></Link></li>
            
        </ul>
    </header>
    </div>
  )
}
