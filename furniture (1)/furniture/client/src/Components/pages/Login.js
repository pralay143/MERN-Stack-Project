import React from 'react'
import { useForm } from 'react-hook-form'
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import '../css/login.css'
import { Navbar } from '../Navbar';




export const 
Login = () => {

  const { register, handleSubmit } = useForm();
  var navigate = useNavigate()
  const submit = (data) => {
    axios.post("http://localhost:3550/user/user/login", data).then((res) => {
      if (res.data.data) {
        console.log(res.data.data)
       
        
        localStorage.setItem("_id", res.data.data[0]?._id)
        
        const roleName = res.data.data[0]?.role?.name

        if (roleName === "Customer") {

          navigate("/Customerdashboard")
        }
        else if (roleName === "Admin") {
          navigate("/Admindashboard")
        }
        else if (roleName === "Vendor") {
          navigate("/Vendordashboard")
        }
        else {
          toast.error('🦄 No role assigned to this user!', { position: "top-right", theme: "colored" });
        }
    }

    }).catch((err) => {
      console.log("user not found....")
      toast.error('🦄 User Not Found!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        });
    })
  }



  return (

    <div>
     <Navbar/>
    <div className='login'>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <form onSubmit={handleSubmit(submit)}>
        <div class="center">
          <h1>Login</h1>

          <div class="txt_field">
            <input type="text" required {...register("email")} />
            <span></span>
            <label>Email</label>
          </div>

          <div class="txt_field">
            <input type="password" required {...register("password")} />
            <span></span>
            <label>Password</label>
          </div>

          <div class="pass">Forgot Password?</div>

          <input  type="submit" value="Submit" />

          <div class="signup_link">
            Not a member? <a href="/register">Signup</a>
          </div>

        </div>

      </form>

    </div>
    </div>
  )
}

