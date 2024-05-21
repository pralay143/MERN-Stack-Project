import React from 'react'
import axios from 'axios';
import { useForm } from "react-hook-form"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect,useState } from 'react';
import '../css/additem.css'
export const Additems = () => {

  const { register, handleSubmit } = useForm();
  const [category, setcategory] = useState()
  const [brand, setbrand] = useState()

  const submit = (data) => {


    var formData = new FormData();

    formData.append("file", data.file[0]);
    console.log(data)

    axios.post("http://localhost:3550/product/product", formData).then((res) => {
      console.log(res.data.data);
    }).catch((err) => {
      console.log(err);
    })
   
  }
  
    const getcategory = () => {
      axios.get("http://localhost:3550/category/category").then((res) => {
        console.log(res.data.data)
        setcategory(res.data.data)
      })
    }
    const getbrand = () => {
      axios.get("http://localhost:3550/brand/brand").then((res) => {
        console.log(res.data.data)
        setbrand(res.data.data)
      })
    }
   

  useEffect(() => {
    getcategory();
    getbrand();
    // getBrand();
    // getUser();
  }, [])
  return (
    
        <div class="container">
          <form onSubmit={handleSubmit(submit)}>
            <div class="card">
            <a class="loginm">Add Product</a>
              <div class="inputBox">
                <input type="text" required="required" {...register("productName")} />
                <span class="user">productName</span>
              </div>
              <div class="inputBox">
              <select class="form-control form-control-lg" {...register("categoryId")}>
                        {
                          category?.map((s) => {
                            return (<option value={s._id} >{s.categoryName}</option>)
                          })
                        }
                      </select>
                <span class="user">Categories</span>
              </div>
              <div class="inputBox">
              <select class="form-control form-control-lg" {...register("brandId")}>
                        {
                          brand?.map((s) => {
                            return (<option value={s._id} >{s.brandName}</option>)
                          })
                        }
                      </select>
                <span class="user">Brand</span>
              </div>
              <div class="inputBox">
                <input type="text" required="required" {...register("description")} />
                <span class="user">Description</span>
              </div>
              <div class="inputBox">
                <input type="text" required="required" {...register("basePrice")} />
                <span class="user">Price</span>
              </div>
              <div class="inputBox">
                SELECT FILE :<input type="file" {...register("file")} multiple />
              </div>

              <div class="enter"> <input type="submit" value="Add" /> </div>

            </div>
          </form>
        </div>
    
  )
}
