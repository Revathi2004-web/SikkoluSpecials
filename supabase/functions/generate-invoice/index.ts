import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order, customer, items } = await req.json();

    if (!order || !customer || !items) {
      return new Response(
        JSON.stringify({ error: 'Order, customer, and items data required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate simple HTML invoice
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #FF6B35; padding-bottom: 20px; }
    .company-name { font-size: 32px; font-weight: bold; color: #FF6B35; }
    .invoice-title { font-size: 24px; margin-top: 10px; }
    .section { margin-bottom: 30px; }
    .label { font-weight: bold; color: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background-color: #FF6B35; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    .total-row { font-weight: bold; font-size: 18px; background-color: #f9f9f9; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">🛍️ SIKKOLU SPECIALS</div>
    <div>Authentic Srikakulam Products</div>
    <div class="invoice-title">PAYMENT RECEIPT</div>
  </div>

  <div class="section">
    <p><span class="label">Invoice No:</span> #${order.id.slice(0, 8).toUpperCase()}</p>
    <p><span class="label">Date:</span> ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
    <p><span class="label">Payment Status:</span> <span style="color: green;">✓ VERIFIED</span></p>
  </div>

  <div class="section">
    <h3>Customer Details</h3>
    <p><span class="label">Name:</span> ${customer.name}</p>
    <p><span class="label">Phone:</span> ${customer.phone}</p>
    ${customer.email ? `<p><span class="label">Email:</span> ${customer.email}</p>` : ''}
    <p><span class="label">Address:</span> ${order.shipping_address}</p>
  </div>

  <div class="section">
    <h3>Order Items</h3>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item: any) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price}</td>
            <td>₹${item.price * item.quantity}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="3" style="text-align: right;">TOTAL AMOUNT:</td>
          <td>₹${order.total_price}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Thank you for shopping with Sikkolu Specials!</p>
    <p>For support, contact: support@sikkolospecials.com</p>
    <p style="margin-top: 20px; font-size: 10px;">This is a computer-generated invoice and does not require a signature.</p>
  </div>
</body>
</html>
    `;

    // Return HTML invoice
    return new Response(
      JSON.stringify({ 
        success: true, 
        invoice_html: invoiceHTML,
        invoice_url: `data:text/html;base64,${btoa(invoiceHTML)}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Invoice Generation Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate invoice' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
