

const AdminDashboard = () => {
  return (
    

    <div class="main">
    <div class="topbar">
        <div class="toggle">
            <ion-icon name="menu-outline"></ion-icon>
        </div>

        <div class="search">
            <label>
                <input type="text" placeholder="Search here"/>
                <ion-icon name="search-outline"></ion-icon>
            </label>
        </div>

        <div class="user">
            <img src="assets2/imgs/customer01.jpg" alt=""/>
        </div>
    </div>

    {/* <!-- ======================= Cards ================== --> */}
    <div class="cardBox">
        <div class="card">
            <div>
                <div class="numbers">1,500</div>
                <div class="cardName">Daily Views</div>
            </div>

            <div class="iconBx">
                <ion-icon name="eye-outline"></ion-icon>
            </div>
        </div>

        <div class="card">
            <div>
                <div class="numbers">800</div>
                <div class="cardName">Sales</div>
            </div>

            <div class="iconBx">
                <ion-icon name="cart-outline"></ion-icon>
            </div>
        </div>

        <div class="card">
            <div>
                <div class="numbers">720</div>
                <div class="cardName">Comments</div>
            </div>

            <div class="iconBx">
                <ion-icon name="chatbubbles-outline"></ion-icon>
            </div>
        </div>

        <div class="card">
            <div>
                <div class="numbers">4045900</div>
                <div class="cardName">Earning</div>
            </div>

            <div class="iconBx">
                <ion-icon name="cash-outline"></ion-icon>
            </div> 
        </div>
    </div>

    {/* <!-- ================ Order Details List ================= --> */}
     {/* <!-- ================ Order Details List ================= --> */}
  <div class="details">
      <div class="recentOrders">
          <div class="cardHeader">
          <h2>Total Orders</h2>
                        <a href="Orders11" class="btns">View All</a>
             
          </div>

          <table>
              <thead>
                  <tr>
                      <td>Name</td>
                      <td>Price</td>
                      <td>Payment</td>
                      <td>Status</td>
                  </tr>
              </thead>

              <tbody>
                  <tr>
                      <td>Sofa</td>
                      <td>32000</td>
                      <td>Paid</td>
                      <td><span class="status delivered">Delivered</span></td>
                  </tr>

                  <tr>
                      <td>Bed</td>
                      <td>75110</td>
                      <td>Due</td>
                      <td><span class="status pending">Pending</span></td>
                  </tr>

                  <tr>
                      <td>Recliner Sofa</td>
                      <td>52000</td>
                      <td>Paid</td>
                      <td><span class="status return">Return</span></td>
                  </tr>

                  <tr>
                      <td>Dinning Set</td>
                      <td>24020</td>
                      <td>Due</td>
                      <td><span class="status inProgress">In Progress</span></td>
                  </tr>

                  <tr>
                      <td>Chair</td>
                      <td>10200</td>
                      <td>Paid</td>
                      <td><span class="status delivered">Delivered</span></td>
                  </tr>

                  <tr>
                      <td>Bed</td>
                      <td>25110</td>
                      <td>Due</td>
                      <td><span class="status pending">Pending</span></td>
                  </tr>

                  <tr>
                      <td>Cupboard</td>
                      <td>62000</td>
                      <td>Paid</td>
                      <td><span class="status return">Return</span></td>
                  </tr>

                  <tr>
                      <td>KamaSutra Chair</td>
                      <td>74020</td>
                      <td>Due</td>
                      <td><span class="status inProgress">In Progress</span></td>
                  </tr>
              </tbody>
          </table>
      </div>

      {/* <!-- ================= New Customers ================ --> */}
      <div class="recentCustomers">
          <div class="cardHeader">
              <h2>Recent Customers</h2>
          </div>

          <table>
              <tr>
                  <td width="60px">
                      <div class="imgBx"><img src="assets2/imgs/customer02.jpg" alt=""/></div>
                  </td>
                  <td>
                      <h4>Meghal patel <br/> <span>Ahemdabad</span></h4>
                  </td>
              </tr>

              <tr>
                  <td width="60px">
                      <div class="imgBx"><img src="assets2/imgs/customer01.jpg" alt=""/></div>
                  </td>
                  <td>
                      <h4>Raza  <br/> <span>Modasa</span></h4>
                  </td>
              </tr>

              <tr>
                  <td width="60px">
                      <div class="imgBx"><img src="assets2/imgs/customer02.jpg" alt=""/></div>
                  </td>
                  <td>
                      <h4>Sruti  <br/> <span>Jamnagar</span></h4>
                  </td>
              </tr>

              <tr>
                  <td width="60px">
                      <div class="imgBx"><img src="assets2/imgs/customer01.jpg" alt=""/></div>
                  </td>
                  <td>
                      <h4>Amit <br/> <span>Himatnagar</span></h4>
                  </td>
              </tr>

              <tr>
                  <td width="60px">
                      <div class="imgBx"><img src="assets2/imgs/customer02.jpg" alt=""/></div>
                  </td>
                  <td>
                      <h4>Riya <br/> <span>Udaipur</span></h4>
                  </td>
              </tr>

              <tr>
                  <td width="60px">
                      <div class="imgBx"><img src="assets2/imgs/customer01.jpg" alt=""/></div>
                  </td>
                  <td>
                      <h4>Amit <br/> <span>Nagpur</span></h4>
                  </td>
              </tr>

            
          </table>
      </div>
  </div>
</div>
   
    );
};

export default AdminDashboard;
