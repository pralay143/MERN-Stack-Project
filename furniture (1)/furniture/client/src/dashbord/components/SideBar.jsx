import { NavLink, Outlet, Link } from "react-router-dom";

//import react icons
import { FaBars, FaBuilding, FaHome, FaMoneyBill, FaMoneyBillAlt, FaUser } from "react-icons/fa";
import { MdMessage, MdRoom } from "react-icons/md";
import { BiBookAdd, BiLock, BiLogOut, BiSearch } from "react-icons/bi";

//import components and hooks
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SidebarMenu from "../components/SidebarMenu";
import { ToastContainer } from "react-toastify";
import { colors } from "@mui/material";

//creating a routes array for sidebar

const routes = [
  {
    path: "/Admindashboard/Admindashboard",
    name: "AdminDashboard",
    icon: <FaHome />,
  },
  {
    path: "/Admindashboard/AllProducts",
    name: "All Products",
    icon: <FaBuilding />,
  },
  {
    path: "/Admindashboard/AllVendors",
    name: "All Vendors",
    icon: <FaUser />,
  },
  {
    path: "/Admindashboard/Orders",
    name: "Orders",
    icon: <BiBookAdd />,
  },
  {
    path: "/Admindashboard/tenants",
    name: "Tenants",
    icon: <FaUser />,
    // subRoutes: [
    //   {
    //     path: "/settings/profile",
    //     name: "Profile ",
    //     icon: <FaUser />,
    //   },
    //   {
    //     path: "/settings/2fa",
    //     name: "2FA",
    //     icon: <FaLock />,
    //   },
    //   {
    //     path: "/settings/billing",
    //     name: "Billing",
    //     icon: <FaMoneyBill />,
    //   },
    // ],
  },
  {
    path: "/Admindashboard/Earning",
    name: "Earning",
    icon: <FaMoneyBillAlt />,
  },
  {
    path: "/Admindashboard/bills",
    name: "Bills",
    icon: <FaMoneyBill />,
    exact: true,
    // subRoutes: [
    //   {
    //     path: "/settings/profile",
    //     name: "Profile ",
    //     icon: <FaUser />,
    //   },
    //   {
    //     path: "/settings/2fa",
    //     name: "2FA",
    //     icon: <FaLock />,
    //   },
    //   {
    //     path: "/settings/billing",
    //     name: "Billing",
    //     icon: <FaMoneyBill />,
    //   },
    // ],
  },
  {
    path: "/Admindashboard/messages",
    name: "Messages",
    icon: <MdMessage />,
  },
  {
    path: "/Admindashboard/changepassword",
    name: "ChangePassword",
    icon: <BiLock />,
  },
  {
    path: "/",
    name: "Logout",
    icon: <BiLogOut />,
  },
];

//creating a sidebar component

const SideBar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  //creating a show animation for input
  const inputAnimation = {
    hidden: {
      width: 0,
      padding: 0,
      transition: {
        duration: 0.2,
      },
    },
    show: {
      width: "140px",
      padding: "5px 15px",
      transition: {
        duration: 0.2,
      },
    },
  };

  //creating a show animation for sidebar

  const showAnimation = {
    hidden: {
      width: 0,
      opacity: 0,
      transition: {
        duration: 0.5,
      },
    },
    show: {
      opacity: 1,
      width: "auto",
      transition: {
        duration: 0.5,
      },
    },
  };


  //creating a sidebar component
  return (
    <>
      <ToastContainer />

      <div className="main-container">
        <motion.div
          animate={{
            width: isOpen ? "200px" : "45px",

            transition: {
              duration: 0.5,
              type: "spring",
              damping: 10,
            },
          }}
          className={`sidebar `}
        >
          <div className="top_section">
            <AnimatePresence>
              {isOpen && (
                <motion.h1
                  variants={showAnimation}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="logo"
                  style={{
                    color: "black",
                    fontWeight: "600",
                  }}
                >
                  <Link to='/' style={{color:"black"}}>BrownWood </Link>
                </motion.h1>
              )}
            </AnimatePresence>

{/* //creating a toggle button for sidebar */}

            <div className="bars">
              <FaBars onClick={toggle} />
            </div>
          </div>
          <div className="search">
            <div className="search_icon">
              <BiSearch />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.input
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={inputAnimation}
                  type="text"
                  placeholder="Search"
                  style={{
                    color: "black",
                    outline: "none"
                  }}
                />
              )}
            </AnimatePresence>
          </div>

{/* //creating a routes section */}

          <section className="routes">
            {routes.map((route, index) => {
              if (route.subRoutes) {
                return (
                  <SidebarMenu
                    setIsOpen={setIsOpen}
                    route={route}
                    showAnimation={showAnimation}
                    isOpen={isOpen}
                  />
                );
              }

              return (
                <NavLink
                  to={route.path}
                  key={index}
                  className="link"
                  activeClassName="active"
                >
                  <div className="icon">{route.icon}</div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        variants={showAnimation}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        className="link_text"
                      >
                        {route.name}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </NavLink>
              );
            })}
          </section>
        </motion.div>

{/* //creating a main section */}

        <main>
          <Outlet />
          {children}</main>

      </div>
    </>
  );
};

export default SideBar;
