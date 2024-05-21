import React from 'react'
import axios from "axios";
import { useForm } from "react-hook-form"
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import '../css/register.css'
import { Navbar } from '../Navbar';

export const Register = () => {

  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const submit = (data) => {


    console.log(data)
    axios.post("http://localhost:3550/user/user", data).then((res) => {
      // console.log(res)
      toast.success('🦄 User SingUp successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      
    }).catch((err) => {
      console.log(err)
      toast.error('🦄 Error in SignUp!', {
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
  };
  return (
    <div className='regi'>
       <Navbar/>
      <div class="container">
        
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

        <div class="title">Registration</div>
        <div class="content">
          <form onSubmit={handleSubmit(submit)}>
            <div class="user-details">
              <div class="input-box">
                <span class="details">Full Name</span>
                <input type="text" placeholder="Enter your name" required   {...register("name")} />
              </div>

              <div class="input-box">
                <span class="details">Email</span>
                <input type="text" placeholder="Enter your email" required  {...register("email")} />
              </div>

              <div class="input-box">
                <span class="details">Password</span>
                <input type="text" placeholder="Enter your password" required {...register("password")} />
              </div>
              <div class="input-box">
                <span class="details">Confirm Password</span>
                <input type="text" placeholder="Confirm your password" required {...register("password")} />
              </div>
              <div class="input-box">
                <span class="details">Phone Number</span>
                <input type="text" placeholder="Enter your number" required {...register("contactNum")} />
              </div>
            </div>
            <div class="gender-details">
              <input type="radio" name="gender" id="dot-1" value="MALE"  {...register("gender")} />
              <input type="radio" name="gender" id="dot-2" value="FEMALE"  {...register("gender")} />
              <span class="gender-title">Gender</span>
              <div class="category">
                <label for="dot-1">
                  <span class="dot one"></span>
                  <span class="gender">Male</span>
                </label>
                <label for="dot-2">
                  <span class="dot two"></span>
                  <span class="gender">Female</span>
                </label>
              </div>

            </div>
            <div class="role-details">
              <input type="radio" name="role" id="dot-3" value={"646afa59a201bba44448c945"}  {...register("role")} />
              <input type="radio" name="role" id="dot-4" value={"646afa4fa201bba44448c943"}  {...register("role")} />
              <span class="role-title">Role</span>
              <div class="categoryy">
                <label for="dot-3">
                  <span class="dot three"></span>
                  <span class="role">Customer</span>
                </label>
                <label for="dot-4">
                  <span class="dot four"></span>
                  <span class="role">Vendor</span>
                </label>

              </div>
            </div>
            <div class="buttonn">
              <input type="submit" value="Register" />
            </div>
             
          </form>
        </div>
        
      </div>

    </div>
  )
}
