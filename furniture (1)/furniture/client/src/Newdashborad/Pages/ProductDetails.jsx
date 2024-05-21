import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from 'axios'

const ProductDetails = () => {
    
    const [pgs, setpgs] = useState();
    

    useEffect(() => {
        getpgs();
    }, [])

    const getpgs = () => {
        
        axios.get(`http://localhost:3550/product/product/`).then((res) => {
            console.log(res.data.products)
            setpgs(res.data.products) 
        }
        )
    }

    

    return (
        <div>
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <img src={pgs?.file} alt="" />
                                    </div>
                                    <div className="col-md-6">
                                        <h3>{pgs?.productName}</h3>
                                        <p>{pgs?.categoryId?.categoryName}</p>
                                        <p>{pgs?.brandId?.brandName}</p>
                                        <p>{pgs?.basePrice}</p>
                                        <p>{pgs?.qty}</p>
                                        <p>{pgs?.description}</p>
                                        
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default ProductDetails