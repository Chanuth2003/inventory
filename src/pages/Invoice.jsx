import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Invoice.css';

function Invoice() {
  const { saleId } = useParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await api.get(`/sales/${saleId}/invoice`);
        setInvoiceData(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setError(error.response?.data?.error || 'Failed to fetch invoice. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [saleId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="invoice-loading">Loading invoice...</div>;
  if (error) return <div className="invoice-error">{error}</div>;
  if (!invoiceData || !invoiceData.sale) return <div className="invoice-error">No invoice found.</div>;

  const { sale, saleItems, payments, customer } = invoiceData;

  // Parse numeric fields with fallbacks
  const totalAmount = parseFloat(sale.total_amount) || 0;
  const deliveryCharges = parseFloat(sale.delivery_charges) || 0;
  const subtotal = totalAmount - deliveryCharges; // Subtotal = total_amount - delivery_charges
  const formattedSubtotal = isNaN(subtotal) ? 'N/A' : subtotal.toFixed(2);
  const formattedDelivery = isNaN(deliveryCharges) ? 'N/A' : deliveryCharges.toFixed(2);
  const formattedTotal = isNaN(totalAmount) ? 'N/A' : totalAmount.toFixed(2);

  // Calculate total paid amount
  const totalPaid = payments
    ? payments
        .filter(p => p.method === 'cash' || (p.method === 'cheque' && p.cheque_status === 'processed'))
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
    : 0;
  const remainingAmount = totalAmount - totalPaid;
  const isPaid = remainingAmount <= 0;

  return (
    <div className="invoice-page">
      <div className="invoice-container">
        <div className="invoice-header">
          <div>
            <h1>Invoice</h1>
            <p>Invoice ID: {sale.id}</p>
            <p>Bill No: {sale.bill_no}</p>
            <p>Date: {new Date(sale.date).toLocaleDateString()}</p>
          </div>
          <div className="invoice-header-right">
            <img
              src="https://via.placeholder.com/100x50?text=Logo"
              alt="Company Logo"
              className="invoice-logo"
            />
            <p className="invoice-company-name">Your Company Name</p>
            <p>123 Business St, City, Country</p>
            <p>Phone: +123 456 7890</p>
            <p>Email: info@yourcompany.com</p>
          </div>
        </div>

        <div className="invoice-customer">
          <div>
            <h2>Billed To:</h2>
            <p>{customer.name || 'N/A'}</p>
            <p>{customer.address || 'N/A'}</p>
            <p>Phone: {customer.phone || 'N/A'}</p>
            <p>Email: {customer.email || 'N/A'}</p>
          </div>
          <div className="invoice-customer-right">
            <h2>Invoice Details:</h2>
            <p>Issue Date: {new Date(sale.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="invoice-items">
          <h2>Items</h2>
          <div className="invoice-table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {saleItems && saleItems.length > 0 ? (
                  saleItems.map(item => {
                    const price = parseFloat(item.price);
                    const totalPrice = parseFloat(item.total_price);
                    return (
                      <tr key={item.id}>
                        <td>{item.product_name}</td>
                        <td>{item.unit}</td>
                        <td>Rs. {isNaN(price) ? 'N/A' : price.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>Rs. {isNaN(totalPrice) ? 'N/A' : totalPrice.toFixed(2)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5">No items found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="invoice-payments-total">
          <div>
            <h2>Payments</h2>
            {payments && payments.length > 0 ? (
              <ul>
                {payments.map(payment => {
                  const amount = parseFloat(payment.amount);
                  return (
                    <li key={payment.id}>
                      <span>
                        Method: {payment.method} | Amount: Rs. {isNaN(amount) ? 'N/A' : amount.toFixed(2)}
                      </span>
                      {payment.method === 'cheque' && (
                        <div className="invoice-cheque-details">
                          <p>Cheque #: {payment.cheque_number}</p>
                          <p>Bank: {payment.bank_name}</p>
                          <p>Date: {new Date(payment.cheque_date).toLocaleDateString()}</p>
                          <p>Status: {payment.cheque_status}</p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No payments found</p>
            )}
          </div>
          <div className="invoice-total">
            <p>
              <span>Subtotal:</span> Rs. {formattedSubtotal}
            </p>
            <p>
              <span>Delivery Charges:</span> Rs. {formattedDelivery}
            </p>
            <p>
              <span>Tax (0%):</span> Rs. 0.00
            </p>
            <p className="invoice-total-amount">
              <span>Total:</span> Rs. {formattedTotal}
            </p>
            <p className={`invoice-status ${isPaid ? 'paid' : 'pending'}`}>
              Status: {isPaid ? 'Paid' : `Pending (Remaining: Rs. ${remainingAmount.toFixed(2)})`}
            </p>
          </div>
        </div>

        <div className="invoice-footer">
          <p>Thank you for your business!</p>
          <p>Terms: Payment due within 30 days. Contact us for any inquiries.</p>
        </div>
      </div>
      <div className="invoice-print-button no-print">
        <button onClick={handlePrint}>Print Invoice</button>
      </div>
    </div>
  );
}

export default Invoice;