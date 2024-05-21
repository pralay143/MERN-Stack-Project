// pg details

const Pgdetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [pgs, setpgs] = useState();
    const [type, settype] = useState();
    const [pgtype, setroles] = useState();

    useEffect(() => {
        getpgs();
    }, [])

    const getpgs = () => {

        axios.get(`http://localhost:5000/pg/get/${id}/`).then((res) => {
            console.log(res.data.data)
            setpgs(res.data.data)
        }
        )
    }

    useEffect(() => {
        gettype();
    }, []);

    const gettype = () => {
        axios.get("http://localhost:5000/propertyType/get").then((res) => {
            console.log(res.data.data)
            settype(res.data.data);
        });
    };

    useEffect(() => {
        getpgtype();
    }, []);

    const getpgtype = () => {
        axios.get("http://localhost:5000/pgType/get").then((res) => {
            console.log(res.data.data)
            setroles(res.data.data);
        });
    };

    return (
        <div>
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <img src={pgs?.image} alt="" />
                                    </div>
                                    <div className="col-md-6">
                                        <h3>{pgs?.name}</h3>
                                        <p>{pgs?.address}</p>
                                        <p>{pgs?.rent}</p>
                                        <p>{pgs?.deposit}</p>
                                        <p>{pgs?.type}</p>
                                        <p>{pgs?.pgtype}</p>
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