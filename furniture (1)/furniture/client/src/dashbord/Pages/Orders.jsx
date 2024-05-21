

const Bookings = () => {
return (
 

  <div class="main">
 

  {/* <!-- ======================= Cards ================== --> */}
  <div class="cardBox">
      <div class="card">
          <div>
              <div class="numbers">1749</div>
              <div class="cardName">Total Order</div>
          </div>

          <div class="iconBx">
              <ion-icon name="eye-outline"></ion-icon>
          </div>
      </div>

      <div class="card">
          <div>
              <div class="numbers">126</div>
              <div class="cardName">Return Order</div>
          </div>

          <div class="iconBx">
              <ion-icon name="cart-outline"></ion-icon>
          </div>
      </div>

      <div class="card">
          <div>
              <div class="numbers">244</div>
              <div class="cardName">Pending Order</div>
          </div>

          <div class="iconBx">
              <ion-icon name="chatbubbles-outline"></ion-icon>
          </div>
      </div>

      <div class="card">
          <div>
              <div class="numbers">1385</div>
              <div class="cardName">Complete Order</div>
          </div>

          <div class="iconBx">
              <ion-icon name="cash-outline"></ion-icon>
          </div>
      </div>
  </div>

  {/* <!-- ================ Order Details List ================= --> */}
  <div class="details">
      <div class="recentOrders">
          <div class="cardHeader">
              <h2>Total Orders</h2>
             
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

export default Bookings;
