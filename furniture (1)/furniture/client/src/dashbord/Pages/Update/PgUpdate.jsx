import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import axios from 'axios'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';

const PgUpdate = () => {
    const { register, handleSubmit } = useForm();
    const [types, settypes] = useState();
    const [pgtypes, setpgtypes] = useState();
    const [pg, setpg] = useState();
    const navigate = useNavigate();
    const { _id } = useParams();

    const getPgById = (_id) => {
        axios.get(`http://localhost:5000/pg/get/${_id}`).then((res) => {
            console.log(res.data.data)
            setpg(res.data.data)

            navigate(`/pg/update/`)
        })
    }

    const updatepg = (data) => {
        axios.put(`http://localhost:5000/pg/update/${_id}`, data).then((res) => {
            console.log(res.data.data)
            toast.success("pg updated successfully")
            // Navigate("/pgbuldings")
        })
    }

    const onSubmit = (data) => {
        console.log(data)

        updatepg(data)
    }

    useEffect(() => {
        getPgById(_id)
    }, [])

    useEffect(() => {
        axios.get("http://localhost:5000/propertytype/get").then((res) => {
            console.log(res.data.data)
            settypes(res.data.data);
        });
    }, []);

    useEffect(() => {
        axios.get("http://localhost:5000/pgtype/get").then((res) => {
            console.log(res.data.data)
            setpgtypes(res.data.data);  
        });
    }, []);


      


    return (
        <div>
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <form onSubmit={handleSubmit(onSubmit)}>

                            <table>
                                <tr>
                                    <td>Id</td>
                                    <td><input type="text" name="id" defaultValue={pg?.id} {...register ('id')} /></td>
                                </tr>
                                <tr>
                                    <td>Property Type</td>
                                    <td>
                                        <select name="propertyType" defaultValue={pg?.propertyType} {...register('propertyType')}>
                                            <option value="">Select</option>
                                            {types?.map((type) => (
                                                <option value={type.id}>{type.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>

                                    <td>Pg Type</td>
                                    <td>
                                        <select name="pgType" defaultValue={pg?.pgType} {...register('pgType')}>
                                            <option value="">Select</option>
                                            {pgtypes?.map((pgtype) => (
                                                <option value={pgtype.id}>{pgtype.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Name</td>
                                    <td><input type="text" name="name" defaultValue={pg?.name} {...register('name')} /></td>
                                </tr>
                                <tr>
                                    <td>Address</td>
                                    <td><input type="text" name="address" defaultValue={pg?.address} {...register('address')} /></td>
                                </tr>
                                <tr>
                                    <td>Rent</td>
                                    <td><input type="text" name="rent" defaultValue={pg?.rent} {...register('rent')} /></td>
                                </tr>
                                <tr>
                                              
                                    <td>Image</td>
                                    <td><input type="text" name="image" defaultValue={pg?.image} {...register('image')} /></td>
                                </tr>
                                <tr>
                                    <td>Details</td>
                                    <td><input type="text" name="details" defaultValue={pg?.details} {...register('details')} /></td>

                                </tr>
                                <tr>
                                    <td></td>
                                    <td><input type="submit" value="Update" /></td>
                                </tr>
                            </table>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default PgUpdate;
  