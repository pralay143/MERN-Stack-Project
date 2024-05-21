import axios from 'axios';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
 
export const AddProduct = () => {
  const { register, handleSubmit } = useForm(); 
  const [cat, setcategory] = useState()
   const [brand, setbrand] = useState()
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

  const addNewProduct = (data) => {

    const formData = new FormData();
    formData.append("id", data.id);
    formData.append("productName", data.productName);
    formData.append("categoryId", data.categoryId);
    formData.append("brandId", data.brandId);
    formData.append("file", data.file[0])
    formData.append("qty", data.qty);
    formData.append("basePrice", data.basePrice);
    formData.append("description", data.description);
    

    axios.post("http://localhost:3550/product/product", formData).then((res) => {
        console.log(res.data)
        toast.success("Product added successfully")
    }) .catch((err)=>{
      console.log(err);
    })

    axios.post("http://localhost:3550/vproduct/add",formData).then((res) => {
      console.log(res.data)
      toast.success("Product added successfully")
      
  }) .catch((err)=>{
    console.log(err);
  })

    localStorage.setItem("product", JSON.stringify(data))

}



  useEffect(() => {
    getCategory();
    getBrand();
    getVendor();
    getLoggedinUserData()

    getProduct();
    // getUser();
  }, [])

  const getProduct = (data) => {
    axios.get("http://localhost:3550/product/product", data).then((res) => {
      console.log("-------",res?.data?.data?._id)
      setproduct(res?.data?.data?._id)
      var id = res.data._id
      localStorage.setItem("id----",id)
      var pid = localStorage.getItem("id");
      console.log(pid) 
    })
  }
  const getCategory = () => {
    axios.get("http://localhost:3550/category/category").then((res) => {
      console.log(res.data.data)
      setcategory(res.data.data)
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
  

  const getBrand = () => {
    axios.get("http://localhost:3550/brand/brand").then((res) => {
      console.log(res.data.data)
      setbrand(res.data.data)
    })
  }
  return (
    <div>
      <div class="container">
        <section class="py-5 bg-light">
          <div class="container">
            <div class="row px-4 px-lg-5 py-lg-4 align-items-center">
              <div class="col-lg-6">
                <h1 class="h2 text-uppercase mb-0">Add NewProduct</h1>
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
          <h2 class="h5 text-uppercase mb-4 text-lg-end">New Product</h2>
          <div class="row">
            <div class="col-lg-8">
              <form onSubmit={handleSubmit(addNewProduct)}>
                <div class="row gy-3">
                  <div class="col-lg-6">
                    <label class="form-label text-sm text-uppercase" for="firstName">Product name </label>
                    <input class="form-control form-control-lg" type="text" id="firstName" placeholder="Enter your Product name"{...register("productName")} />
                  </div>
                  <div class="col-lg-6">
                    <label class="form-label text-sm text-uppercase" for="state">category </label>
                    <select class="form-control form-control-lg" {...register("categoryId")}>
                      {
                        cat?.map((s) => {
                          return (<option value={s._id} >{s.categoryName}</option>)
                        })
                      }
                    </select>

                  </div>

                  
                  <div class="col-lg-6">
                    <label class="form-label text-sm text-uppercase" for="city">Brand </label>
                    <select class="form-control form-control-lg" {...register("brandId")}>
                      {
                        brand?.map((b) => {
                          return (<option value={b._id} >{b.brandName}</option>)
                        })
                      }
                    </select>

                  </div>
                  <div class="col-lg-6">
                    <label class="form-label text-sm text-uppercase" for="pincode">Description</label>
                    <input class="form-control form-control-lg" type="text" id="pincode" placeholder="Description"{...register("description")} />
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
                    <label class="form-label text-sm text-uppercase" for="pincode">Qty</label>
                    <input class="form-control form-control-lg" type="text" id="pincode" placeholder="Qty"{...register("qty")} />
                  </div>
                 
                 
                  <div class="col-lg-6">
                    <label class="form-label text-sm text-uppercase" for="pincode">price</label>
                    <input class="form-control form-control-lg" type="text" id="pincode" placeholder="Price"{...register("basePrice")} />
                  </div>
                   <div class="col-lg-6">
                    <label class="form-label text-sm text-uppercase" for="pincode">Image</label>
                    <input class="form-control form-control-lg" type="file" id="pincode" placeholder="image"{...register("file")} />
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
// import axios from 'axios';
// import React from 'react'
// import { useEffect } from 'react';
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { Link } from 'react-router-dom';

// export const AddProduct = () => {
//   const { register, handleSubmit } = useForm();
//   const [cat, setCategory] = useState([]);

//   const [brand, setBrand] = useState([]);
//   const [productId, setProduct] = useState();
//   const [user, setUser] = useState('');
//   const [fileData, setFileData] = useState();

//   useEffect(() => {
//     getCategory();
//     getBrand();
//     getLoggedinUserData();
//   }, []);

//   const getLoggedinUserData = () => {
//     var id = localStorage.getItem('_id');
//     axios.get(`http://localhost:3550/user/user/${id}`)
//       .then((res) => {
//         console.log(res.data.data);
//         setUser(res.data.data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   };

//   const getCategory = () => {
//     axios.get('http://localhost:3550/category/category')
//       .then((res) => {
//         console.log(res.data.data);
//         setCategory(res.data.data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   };

  

//   const getBrand = () => {
//     axios.get('http://localhost:3550/brand/brand')
//       .then((res) => {
//         console.log('brand...........', res.data.data);
//         setBrand(res.data.data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   };

//   const submit =  (data) => {
//     console.log("clicked")
    
//     var formData = new FormData();
//     formData.append('file', data.file[0]);
//     formData.append("productName", data.productName);
//     formData.append("categoryId", data.categoryId);
//     formData.append("brandId", data.brandId);
//     formData.append("basePrice", data.basePrice);
//     formData.append("qty", data.qty);
//     const response =  axios.post('http://localhost:3550/upload/upload', formData);
//     if (response != null || response != undefined) {
//       setFileData(response?.data?.data?._id);
      
      
//     }
//     if (fileData != null || fileData != undefined) {
//       var prodata = {
//         user: localStorage.getItem('_id'),
//         productName: data.productName,
//         categoryId: data.categoryId,
//         brandId: data.brandId,
//         file: fileData,
//         basePrice: data.basePrice,
//         qty:data.qty
        
//       };
       

    
//        axios.post('http://localhost:3550/product/product', prodata).then((res) => {
//         console.log(res.data.data);
//         setProduct(res.data.data._id);
//         console.log();

//       }).catch((err) => {
//           console.log(err);
//         });

//       if (productId != null || productId !== undefined) {
//         var vdata = {
//           productId: productId,
//           vendorId: localStorage.getItem('vendor'),
//           qty: data.qty,
//           price: data.price
//         };
//         console.log(vdata);
//          axios.post('http://localhost:3550/vendor/vendor', vdata).then((res) => {
//           console.log(res.data.data)
//           alert("add");
//         })
//           .catch((err) => {
//             console.log(err);
//           });
//       }
//     }
//   };
//   return (
//     <div>
//       <div class="container">
//         <section class="py-5 bg-light">
//           <div class="container">
//             <div class="row px-4 px-lg-5 py-lg-4 align-items-center">
//               <div class="col-lg-6">
//                 <h1 class="h2 text-uppercase mb-0">Add Details</h1>
//               </div>
//               <div class="col-lg-6 text-lg-end">
//                 <nav aria-label="breadcrumb">
//                   <ol class="breadcrumb justify-content-lg-end mb-0 px-0 bg-light">
//                     <li class="breadcrumb-item"><Link to="/vendordashboard" class="text-dark">Home</Link></li>
//                     <li class="breadcrumb-item active" aria-current="page">Add Details</li>
//                   </ol>
//                 </nav>
//               </div>
//             </div>
//           </div>
//         </section>
//         <section class="py-5">
//           <h2 class="h5 text-uppercase mb-4 text-lg-end">Vendor details</h2>
//           <div class="row">
//             <div class="col-lg-8">
//               <form onSubmit={handleSubmit(submit)}>
//                 <div class="row gy-3">
//                   <div class="col-lg-6">
//                     <label class="form-label text-sm text-uppercase" for="firstName">Product name </label>
//                     <input class="form-control form-control-lg" type="text" id="firstName" placeholder="Enter your Product name"{...register("productName")} />
//                   </div>
//                   <div class="col-lg-6">
//                     <label class="form-label text-sm text-uppercase" for="state">category </label>
//                     <select class="form-control form-control-lg" {...register("categoryId")}>
//                       {
//                         cat?.map((s) => {
//                           return (<option value={s._id} >{s.categoryName}</option>)
//                         })
//                       }
//                     </select>

//                   </div>

                  
//                   <div class="col-lg-6">
//                     <label class="form-label text-sm text-uppercase" for="city">Brand </label>
//                     <select class="form-control form-control-lg" {...register("brandId")}>
//                       {
//                         brand?.map((b) => {
//                           return (<option value={b._id} >{b.brandName}</option>)
//                         })
//                       }
//                     </select>

//                   </div>
//                   {/* {<div class="col-lg-6">
//                 <label class="form-label text-sm text-uppercase" for="user">User </label>
//                 <select class="form-control form-control-lg" {...register("user")}>
//                              {
//                                    user?.map((u)=>{
//                                       return(<option value={u._id} >{u.name}</option>)
//                                    })
//                              }
//                                         </select>
//               </div>} */}
//                   <div class="col-lg-6">
//                     <label class="form-label text-sm text-uppercase" for="phone">Product Img</label>
//                     <input class="form-control form-control-lg" type="file" id="file" placeholder="img"{...register("file")} />
//                   </div>
//                   <div class="col-lg-6">
//                     <label class="form-label text-sm text-uppercase" for="pincode">baseprice</label>
//                     <input class="form-control form-control-lg" type="text" id="pincode" placeholder="Base Price"{...register("BasePrice")} />
//                   </div>

//                   <div class="col-lg-6">
//                     <label class="form-label text-sm text-uppercase" for="pincode">Qty</label>
//                     <input class="form-control form-control-lg" type="text" id="pincode" placeholder="Qty"{...register("qty")} />
//                   </div>
                  
//                   <div class="col-lg-12 form-group">

//                     <button class="btn btn-dark" type="submit">Submit</button>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//   )
// } 