

const Rent = () => {
  return (
   

    <div class="main">
       
  
    {/* <!-- ======================= Cards ================== --> */}
    <div class="cardBox">
        <div class="card">
            <div>
                <div class="numbers">474900</div>
                <div class="cardName">Income</div>
            </div>
  
            <div class="iconBx">
                <ion-icon name="eye-outline"></ion-icon>
            </div>
        </div>
  
        <div class="card">
            <div>
                <div class="numbers">126050</div>
                <div class="cardName">Refund</div>
            </div>
  
            <div class="iconBx">
                <ion-icon name="cart-outline"></ion-icon>
            </div>
        </div>
  
        <div class="card">
            <div>
                <div class="numbers">180040</div>
                <div class="cardName">Pending Payment</div>
            </div>
  
            <div class="iconBx">
                <ion-icon name="chatbubbles-outline"></ion-icon>
            </div>
        </div>
  
        <div class="card">
            <div>
                <div class="numbers">348850</div>
                <div class="cardName">Complete Payment</div>
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
                <h2>Payment History</h2>
               
            </div>
  
            <table>
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Ammount</td>
                        <td>Type</td>
                        <td>Status</td>
                    </tr>
                </thead>
  
                <tbody>
                    <tr>
                        <td>Meghal</td>
                        <td>32000</td>
                        <td>UPI</td>
                        <td><span class="status delivered">Complete</span></td>
                    </tr>
  
                    <tr>
                        <td>Mohit</td>
                        <td>45900</td>
                        <td>CREDIT CARD</td>
                        <td><span class="status delivered">Complete</span></td>
                    </tr>
  
                    <tr>
                        <td>Rushvik</td>
                        <td>12500</td>
                        <td>UPI</td>
                        <td><span class="status delivered">Pending</span></td>
                    </tr>
                    <tr>
                        <td>Raza</td>
                        <td>25500</td>
                        <td>CASH</td>
                        <td><span class="status delivered">Refund</span></td>
                    </tr>
  
                    <tr>
                        <td>Sruti</td>
                        <td>35450</td>
                        <td>RTGS</td>
                        <td><span class="status delivered">Complete</span></td>
                    </tr>
  
                    <tr>
                        <td>Riya</td>
                        <td>52080</td>
                        <td>UPI</td>
                        <td><span class="status delivered">Refund</span></td>
                    </tr>
  
                    <tr>
                        <td>Amit</td>
                        <td>37500</td>
                        <td>RTGS</td>
                        <td><span class="status delivered">Pending</span></td>
                    </tr>
  
                    <tr>
                        <td>Parth</td>
                        <td>45600</td>
                        <td>CASH</td>
                        <td><span class="status delivered">Complete</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
  
        {/* <!-- ================= New Customers ================ --> */}
     
    </div>
  </div>
    
    );
};

export default Rent;
