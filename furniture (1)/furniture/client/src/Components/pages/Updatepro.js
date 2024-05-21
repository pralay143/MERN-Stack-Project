import React from 'react'
import axios from 'axios';
import { useForm } from "react-hook-form"
import { useState ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/updatepro.css'

export const Updatepro = () => {

  const { register, handleSubmit } = useForm();
  const [user, setuser] = useState('')
  const navigate = useNavigate();
  
  const [state, setstate] = useState()
  const [city, setcity] = useState()
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
  useEffect(() => {
    getState();
    getCity();
    // getBrand();
    // getUser();
  }, [])

  const getState = () => {
    axios.get("http://localhost:3550/state/state").then((res) => {
      console.log(res.data.data)
      setstate(res.data.data)
    })
  }
  const getCity = () => {
    axios.get("http://localhost:3550/city/city").then((res) => {
      console.log(res.data.data)
      setcity(res.data.data)
    })
  }
  const submit = (data) => {


    console.log(data)
    axios.post("http://localhost:3550/vendor/vendor", data).then((res) => {
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
      navigate("/Profile")
    }).catch((err) => {
      console.log(err)
    })
 
  }


  return (

    <div className='regi'>
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

        <div class="title">Profile Update</div>
        <div class="content">
          <form onSubmit={handleSubmit(submit)}>
            <div class="user-details">
              <div class="input-box">
                <span class="details">Vendor Name</span>
                <input type="text" placeholder="Enter your name" required   {...register("vendorName")} />
              </div>

              <div class="input-box">
                <span class="details">Address</span>
                <input type="text" placeholder="Enter your Office.No.." required  {...register("address")} />
              </div>

              <div class="input-box">
                <span class="details">State</span>

                <select class="form-control form-control-lg" {...register("stateId")}>
                        {
                          state?.map((s) => {
                            return (<option value={s._id} >{s.stateName}</option>)
                          })
                        }
                      </select>
                
              </div>
              <div class="input-box">
                <span class="details">City</span>
                <select class="form-control form-control-lg" {...register("cityId")}>
                        {
                          city?.map((s) => {
                            return (<option value={s._id} >{s.cityName}</option>)
                          })
                        }
                      </select>
                
              </div>
              <div class="input-box">
                <span class="details">Pincode</span>
                <input type="text" placeholder="Enter your pincode" required {...register("pincode")} />
              </div>
              <div class="input-box">
                <span class="details">Contact Number</span>
                <input type="text" placeholder="Enter your Contact No" required {...register("contactNum")} />
              </div>
              <div class="input-box">
                <span class="details">CustomerSupportNumber</span>
                <input type="text" placeholder="Enter your CUS No" required {...register("customerSupportNumber")} />
              </div>

              <div class="input-box">
                <span class="details">FeedbackEmail</span>
                <input type="text" placeholder="Enter your Feedback Email" required {...register("feedbackemail")} />
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
