import axios from 'axios';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
 
export const AddDetails = () => {
  const { register, handleSubmit } = useForm(); 
  const [state, setstate] = useState()
   const [city, setcity] = useState()
  const [productid, setproduct] = useState()
  const [vendorid, setvendor] = useState()

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

  const submit = (data) => {
    var bdata ={
    user:localStorage.getItem("_id"),
    vendorName:data.vendorName,
    address:data.address,
    state:data.state,
    city:data.city,
    pincode:data.pincode,
    contactNum:data.contactNum,
    customerSupportNumber:data.customerSupportNumber,
    feedbackemail:data.feedbackemail
    }       
         console.log(data)
         axios.post("http://localhost:3550/vendor/vendor",bdata).then((res)=>{
             console.log(res.data)
             console.log(res.data.data?._id)
             setvendor(res.data.data?._id)
             localStorage.setItem("vendor",res.data.data?._id)
             localStorage.getItem("vendor")
            }).catch((err)=>{
             console.log(err)
         })
    

}


  useEffect(() => {
    getstate();
    getcity();
    getVendor();
    getLoggedinUserData()

    // getProduct();
    // getUser();
  }, [])

  // const getProduct = () => {
  //   axios.get("http://localhost:3550/product/product", bdata).then((res) => {
  //     console.log("-------",res?.data?.data?._id)
  //     setproduct(res?.data?.data?._id)
  //     // localStorage.setItem("id----",u_id)
  //     // var pid = localStorage.getItem("_id");
  //     // console.log(pid)
  //   })
  // }
  const getstate = () => {
    axios.get("http://localhost:3550/state/state").then((res) => {
      console.log(res.data.data)
      setstate(res.data.data)
    })
  }
  const getVendor = () => {
    axios.get("http://localhost:3550/vendor/vendor").then((res) => {
      console.log(res.data.data)
      setvendor(res.data.data.filter((e)=>{
        // return e._id === localStorage.getItem("_id")
        // console.log(_id)
      }))
    })
  }
  

  const getcity = () => {
    axios.get("http://localhost:3550/city/city").then((res) => {
      console.log(res.data.data)
      setcity(res.data.data)
    })
  }
  return (
    <div>
      <div class="container">
        <section class="py-5 bg-light">
          <div class="container">
            <div class="row px-4 px-lg-5 py-lg-4 align-items-center">
              <div class="col-lg-6">
                <h1 class="h2 text-uppercase mb-0">Add Details</h1>
              </div>
              <div class="col-lg-6 text-lg-end">
                <nav aria-label="breadcrumb">
                  <ol class="breadcrumb justify-content-lg-end mb-0 px-0 bg-light">
                    <li class="breadcrumb-item"><Link to="/vendordashboard" class="text-dark">Home</Link></li>
                    
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </section>
        <section class="py-5">
          <h2 class="h5 text-uppercase mb-4 text-lg-end"></h2>
          <div class="row">
            <div class="col-lg-8">
              <form onSubmit={handleSubmit(submit)}>
                <div class="row gy-3">
                  <div class="col-lg-6">
                    <label class="form-label text-sm text-uppercase" for="firstName">Full Name </label>
                    <input class="form-control form-control-lg" type="text" id="firstName" placeholder="Enter your Full Name"{...register("vendorName")} />
                  </div>
                  <div class="col-lg-6">
                    <label class="form-label text-sm text-uppercase" for="firstName">Contact No</label>
                    <input class="form-control form-control-lg" type="Number" id="firstName" placeholder="Enter your Contact No"{...register("contactNum")} />
                  </div>
                  <div class="col-lg-6">
                    <label class="form-label text-sm text-uppercase" for="state">State </label>
                    <select class="form-control form-control-lg" {...register("stateId")}>
                      {
                        state?.map((s) => {
                          return (<option value={s._id} >{s.stateName}</option>)
                        })
                      }
                    </select>

                  </div>

                  
                  <div class="col-lg-6">
                    <label class="form-label text-sm text-uppercase" for="city">City </label>
                    <select class="form-control form-control-lg" {...register("cityId")}>
                      {
                        city?.map((b) => {
                          return (<option value={b._id} >{b.cityName}</option>)
                        })
                      }
                    </select>

                  </div>
                  <div class="col-lg-6">
                    <label class="form-label text-sm text-uppercase" for="firstName">PinCode </label>
                    <input class="form-control form-control-lg" type="Number" id="firstName" placeholder="Pincode"{...register("pincode")} />
                  </div>
                  <div class="col-lg-6">
                    <label class="form-label text-sm text-uppercase" for="pincode">Address</label>
                    <input class="form-control form-control-lg" type="text" id="pincode" placeholder="Address"{...register("adddress")} />
                  </div>
                  {/* {<div class="col-lg-6">
                <label class="form-label text-sm text-uppercase" for="user">User </label>
                <select class="form-control form-control-lg" {...register("user")}>
                             {
                                   user?.map((u)=>{
                                      return(<option value={u._id} >{u.name}</option>)
                                   })
                             }
                                        </select>
              </div>} */}
                  <div class="col-lg-6">
                    <label class="form-label text-sm text-uppercase" for="pincode">CUS No</label>
                    <input class="form-control form-control-lg" type="Number" id="pincode" placeholder="CUS No"{...register("customerSupportNumber")} />
                  </div>
                 
                 
                  <div class="col-lg-6">
                    <label class="form-label text-sm text-uppercase" for="pincode">FeedBack Email</label>
                    <input class="form-control form-control-lg" type="text" id="pincode" placeholder="feedbackemail"{...register("feedbackemail")} />
                  </div>
                   
                  
                  <div class="col-lg-12 form-group">

                    <button class="btn btn-dark" type="submit">Submit</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}