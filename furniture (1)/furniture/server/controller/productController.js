const productSchema=require('../schema/productSchema')
const path=require('path')
const fs=require('fs')
const multer=require('multer')

const uploadDir = path.resolve(__dirname, '..', '..', 'client', 'public', 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: function(req, file, cb){
        cb(null,file.originalname);
    }
})

const product = multer(
    {
        storage: storage,
        limits: {
            fileSize: 9000000
        },
    }
).single('file');

 const addproduct = (req, res) => {

    console.log(req.file);
    product(req,res,(err)=>{
        if(err){
            res.status(500).json({
                error: err,
                message: 'Error uploading file'
                
            })
        }
        else{
            console.log(req.file.originalname);
            //size
            console.log(req.file.size);
            //abs path
            console.log(req.file.path);
            const filePath = path.join(uploadDir, req.file.originalname)
            console.log(filePath);

            //type
            

            if(req.file ==undefined){
                res.status(400).json({
                    message: 'No file selected'
                })
            }
            else{
                const product = new productSchema(req.body);
                if(req.file){
                    product.file.name= req.file.originalname,
                    product.file.size= req.file.size,
                    product.file.url= path.join('/uploads', req.file.originalname).replace(/\\/g, '/'),
                    product.file.type= req.file.mimetype 
                }

                
                product.save((err,data)=>{
                    if(err){
                        res.status(500).json({
                            error: err,
                            message: 'Error in Adding Product'
                        })
                    }
                    else{
                        res.status(200).json({
                            message: 'Product Added successfully',
                            file: data
                        })
                    }
                })



                // res.status(200).json({
                //     message: 'File uploaded successfully',
                //     file: req.file.originalname
                // })
            }
        }

    })

}


const getproduct=(req,res)=>{

    productSchema.find().populate('categoryId').populate('brandId').exec((err, products) => {
        if (err) {
            res.status(404).json({
                message: "Product not found...."
            })
        } else {
            res.status(200).json({
                message: "Product found successfully....",
                products: products
            })
        }
    })
} 


const updateProduct = (req, res) => {
    const id = req.params.id

    productSchema.findByIdAndUpdate(id, req.body, (err, success) => {
        if (err) {
            res.status(404).json({
                message: "error in updating product"
            })
        } else {
            res.status(200).json({
                message: "product  upadate successfully...",
                data: success
            })
        }
    })
}

const deleteProduct = (req, res) => {
    const id = req.params.id

    productSchema.findByIdAndRemove(id, req.body, (err, success) => {
        if (err) {
            res.status(404).json({
                message: "error in removing product"
            })
        } else {
            res.status(200).json({
                message: "product remove successfully...",
                data: success
            })
        }
    })
}

module.exports={
    addproduct,
    getproduct,
    updateProduct,
    deleteProduct
}