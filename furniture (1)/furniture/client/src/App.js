import './App.css';
import { Helmet } from "react-helmet"
import { BrowserRouter as Router,
  Routes,
  Route
 } from 'react-router-dom';
import { Main } from './Components/pages/Main';
import { Register } from './Components/pages/Register';

import {Shop} from './Components/Shop';
import { Login } from './Components/pages/Login';
import { About } from './Components/About';
import { Contact } from './Components/Contact';
import {Cart} from './Components/pages/Cart'
import { Customerdashboard } from './Components/pages/Customerdashboard';

import AdminDashboard from "./dashbord/Pages/AdminDashboard";
import  AppDashboard from './dashbord/AppDashbord';
import Bills from "./dashbord/Pages/Bills";
import ChangePassword from "./dashbord/Pages/ChangePassword"; 
import Logout from "./dashbord/Pages/Logout";
import Messages from "./dashbord/Pages/Messages";
import AllProducts from "./dashbord/Pages/AllProducts";
import {AddCategory} from './dashbord/Pages/AddCategory';
import Earning from "./dashbord/Pages/Earning";
import Tenants from "./dashbord/Pages/Tenants";
import Orders from "./dashbord/Pages/Orders";
import AllVendors from './dashbord/Pages/AllVendors';

import VDashboard from './Newdashborad/VDashbord';
import VendorDashboard from './Newdashborad/Pages/VendorDashboard';
import AllProducts11 from './Newdashborad/Pages/AllProducts11';
import Orders11 from './Newdashborad/Pages/Orders11';
import Earning11 from './Newdashborad/Pages/Earning11';
import Bills11 from './Newdashborad/Pages/Bills11';

import  Profile from './Newdashborad/Pages/Profile';
import ChangePassword11 from './Newdashborad/Pages/ChangePassword11';
import { AddProduct} from './Newdashborad/Pages/AddProduct'
import { AddDetails } from './Newdashborad/Pages/AddDetails';
import ProductDetails from './Newdashborad/Pages/ProductDetails';






function App() {
  return (

    <Router>
    <div className="App">

      <Helmet>
        {/* <!-- Link To CSS --> */}
        <link rel="stylesheet" href="style.css" />
        {/* <!-- Box Icons --> */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/boxicons@latest/css/boxicons.min.css" />

      </Helmet>

  
        <Routes>
          <Route path='/' element={<Main/>} />
          <Route path='/Login' element={<Login/>} />
          <Route path='/Register' element={<Register/>} />
          <Route path='/Shop'  element={<Shop/>} />
           <Route path='/About'  element={<About/>} />
          <Route path='/Contact' element={<Contact/>}  />
          <Route path='Cart' element={<Cart/>} />
          <Route path='Customerdashboard' element={<Customerdashboard/>} />

          <Route path="/admindashboard/" element={<AppDashboard />}>
          <Route path="admindashboard" element={<AdminDashboard />} />
          <Route path="AllProducts" element={<AllProducts />} />
          <Route path='AddCategory' element={<AddCategory/>} />
          
    {/* route for AdminDashboard */}
          
          <Route path="AllVendors" element={<AllVendors />} />
          <Route path="Orders" element={<Orders />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="Earning" element={<Earning />} />
          <Route path="bills" element={<Bills />} />
          <Route path="messages" element={<Messages />} />
          <Route path="changepassword" element={<ChangePassword />} />
          <Route path="logout" element={<Logout />} />
          
          <Route path="*" element={<> not found</>} />
        </Route>

         <Route path='/Vendordashboard'  element={<VDashboard/>} >
           <Route path='Vendordashboard' element={<VendorDashboard/>}   />       
            <Route path='AllProducts11' element={<AllProducts11/>} />
            
            <Route path='Orders11' element={<Orders11/>} />
            <Route path='Earning11' element={<Earning11/>} />   
            <Route path='Bills11'  element={<Bills11/>} />
            
            <Route path='Profile'  element={<Profile/>} />
            <Route path='Profile/AddDetails' element={<AddDetails/>} />
            <Route path='changepassword11' element={<ChangePassword11/>}/>
            <Route path='AllProducts11/AddProduct' element={<AddProduct/>} />
            <Route path='AllProducts11/ProductDetails' element={<ProductDetails/>} />
         </Route>

          

       </Routes>
      


      {/* <!-- Link JS --> */}
      <script src="script.js"></script>


    </div>
    </Router>
  );
}

export default App;
