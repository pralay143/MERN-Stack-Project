import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useStepContext } from '@mui/material'
import "../App.css"
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify';



// get data from database usin axios

const AllVendors = () => {
    const navigate = useNavigate();

    const handleDelete = async (pg) => {
        setpgs(pgs.filter((p) => p._id !== pg._id));
        await axios.delete(`http://localhost:3550/user/user/${pg._id}`);
      };

    // function editpg 
    // function deletepg

    //get pg by id
    const [pge, setpge] = useState()
    const { id } = useParams()
    const getpgById = () => {
        
            navigate(`pg/update`)
        
    }
    //update pg

      const onSubmit = () => {
        console.log("update pg")

        getpgById()
        
        
    }



    const [pgs, setpgs] = useState()
    

    useEffect(() => {
        getpgs();
    }, [])

    const getpgs = () => {

        axios.get("http://localhost:3550/vendor/vendor").then((res) => {
            console.log(res.data.data)

            setpgs(res.data.data)
        
        
        })
    }

 


    return (
        <div className='tcontainer'>
            <div >All Vendors</div>
            <section class=" h-screen overflow-hidden flex justify-center" >
                <div class="table w-full p-2" >
               
                    <table class=" border" >
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border px-4 py-2">id</th>
                                <th class="border px-4 py-2">name</th>
                                <th class="border px-4 py-2">Contact</th>
                                <th class="border px-4 py-2">Address</th>
                                <th class="border px-4 py-2">State</th>
                                <th class="border px-4 py-2">City</th>
                                <th class="border px-4 py-2">CUS Number</th>
                                <th class="border px-4 py-2">FeedBackEmail</th>
                               
                                <th class="border px-4 py-2">Action</th>

                            </tr>
                        </thead>
                        <tbody>
                            {pgs?.map((pg) => (
                                <tr>
                                    <td class="border px-4 py-2">{pg._id}</td>
                                    <td class="border px-4 py-2">{pg.vendorName}</td>
                                    <td class="border px-4 py-2">{pg.contactNum}</td>
                                    <td class="border px-4 py-2">{pg.address}</td>
                                    <td class="border px-4 py-2">{pg.cityId.cityName}</td>
                                    <td class="border px-4 py-2">{pg.stateId.stateName}</td>
                                   
                                  
                                    <td class="border px-4 py-2">{pg.customerSupportNumber}</td>
                                    <td class="border px-4 py-2">{pg.feedbackemail}</td>
                                  

                                    <td class="border px-4 py-2">
                                        <button  onClick={
                                            () => onSubmit()
                                        } class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Edit</button>
                                        <button onClick={() => handleDelete(pg)} class="btnn">Delete</button>
                                    </td>



                                </tr>



                            ))}



                        </tbody>

                    </table>
                </div>
            </section>

        </div>
    )
}

export default AllVendors