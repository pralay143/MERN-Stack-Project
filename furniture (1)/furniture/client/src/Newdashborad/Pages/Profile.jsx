import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useStepContext } from '@mui/material'
import "../App.css"
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify';



// get data from database usin axios

const Profile = () => {
    const navigate = useNavigate();
    const [pgs, setpgs] = useState()

   
    useEffect(() => {
        getpgs();
    }, [])
    const id = localStorage.getItem('_id')
    const getpgs = () => {
        axios.get(`http://localhost:3550/user/user/${id}`).then((res) => {
            console.log(res.data.data)
            setpgs(res.data.data)
        })
    }

   

    


    return (
        <div className='tcontainer'>
            <div  className='font'>My Profile</div>
            <section class=" h-screen overflow-hidden flex justify-center" >
                <div class="table w-full p-2" >
                <button
                    onClick={() => navigate("AddDetails")}
                    className="btn"
                >
                  Add Details 
                </button>
                    <table class=" border" >
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border px-4 py-2">Id</th>
                                <th class="border px-4 py-2">Name</th>
                                <th class="border px-4 py-2">Email</th>
                                <th class="border px-4 py-2">Password</th>
                                <th class="border px-4 py-2">Gender</th>
                                <th class="border px-4 py-2">Contact No</th>
                                <th class="border px-4 py-2">Role</th>
                                                              

                            </tr>
                            </thead>
                       <tbody>
          
                                <tr>
                                    <td class="border px-4 py-2">{pgs?._id}</td>
                                   
                                    <td class="border px-4 py-2">{pgs?.name}</td>
                                    <td class="border px-4 py-2">{pgs?.email}</td>
                                    <td class="border px-4 py-2">{pgs?.password}</td>
                                    <td class="border px-4 py-2">{pgs?.gender}</td>
                                    <td class="border px-4 py-2">{pgs?.contactNum}</td>
                                    <td class="border px-4 py-2">{pgs?.role?.roleName}</td>

                                    



                                </tr>

                                   

                          
                            </tbody>

                    </table>
                </div>
            </section>

        </div>
    )
}

export default Profile