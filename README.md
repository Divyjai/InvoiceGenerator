# InvoiceGenerator
Invoice Generator is a responsive web app that simplifies invoice creation for small businesses, freelancers, and individuals. Built with HTML, CSS, and JavaScript, it enables users to quickly generate dynamic, printable invoices while reducing manual calculations and formatting errors.
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Generator</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Invoice Generator</h1>
            <p>Create, customize, and download professional invoices</p>
        </header>

        <div class="invoice-form">
            <!-- Invoice Header Section -->
            <div class="invoice-header">
                <div class="invoice-details">
                    <h2>Invoice Details</h2>
                    <div class="form-group">
                        <label for="invoiceNo">Invoice No.</label>
                        <input type="text" id="invoiceNo" value="INV-2023-001">
                    </div>
                    <div class="form-group">
                        <label for="invoiceDate">Invoice Date</label>
                        <input type="date" id="invoiceDate">
                    </div>
                    <div class="form-group">
                        <label for="currency">Currency</label>
                        <select id="currency">
                            <option value="INR">₹ - Indian Rupee (INR)</option>
                            <option value="USD">$ - US Dollar (USD)</option>
                            <option value="EUR">€ - Euro (EUR)</option>
                            <option value="GBP">£ - British Pound (GBP)</option>
                            <option value="JPY">¥ - Japanese Yen (JPY)</option>
                        </select>
                    </div>
                </div>

                <div class="seller-info">
                    <h2>From</h2>
                    <div class="form-group">
                        <label for="sellerName">Your Name/Business</label>
                        <input type="text" id="sellerName" placeholder="Your Name or Business Name">
                    </div>
                    <div class="form-group">
                        <label for="sellerProfession">Profession/Business Type</label>
                        <input type="text" id="sellerProfession" placeholder="Web Developer, Consultant, etc.">
                    </div>
                    <div class="form-group">
                        <label for="sellerEmail">Email</label>
                        <input type="email" id="sellerEmail" placeholder="your.email@example.com">
                    </div>
                </div>

                <div class="client-info">
                    <h2>Bill To</h2>
                    <div class="form-group">
                        <label for="clientName">Client Name</label>
                        <input type="text" id="clientName" placeholder="Client Name or Business">
                    </div>
                    <div class="form-group">
                        <label for="clientAddress">Address</label>
                        <textarea id="clientAddress" placeholder="Client's Address" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="clientEmail">Email</label>
                        <input type="email" id="clientEmail" placeholder="client.email@example.com">
                    </div>
                </div>
            </div>

            <!-- Invoice Items Section -->
            <div class="invoice-items">
                <h2>Invoice Items</h2>
                <div class="table-responsive">
                    <table id="itemsTable">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Description</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Items will be added here dynamically -->
                        </tbody>
                    </table>
                </div>
                <button id="addItemBtn" class="btn-outline">+ Add Item</button>
            </div>

            <!-- Invoice Summary Section -->
            <div class="invoice-summary">
                <div class="notes-terms">
                    <h2>Notes & Terms</h2>
                    <div class="form-group">
                        <label for="notes">Notes</label>
                        <textarea id="notes" rows="3" placeholder="Payment notes or additional information">Thank you for your business!</textarea>
                    </div>
                    <div class="form-group">
                        <div class="checkbox-group">
                            <input type="checkbox" id="termsConditions">
                            <label for="termsConditions">I agree to the <a href="#" id="termsLink">Terms and Conditions</a></label>
                        </div>
                    </div>
                </div>

                <div class="summary-calculation">
                    <h2>Summary</h2>
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span id="subtotal">₹0.00</span>
                    </div>
                    <div class="summary-row">
                        <span>CGST (9%)</span>
                        <span id="cgst">₹0.00</span>
                    </div>
                    <div class="summary-row">
                        <span>SGST (9%)</span>
                        <span id="sgst">₹0.00</span>
                    </div>
                    <div class="summary-row">
                        <span>Discount</span>
                        <div class="discount-container">
                            <input type="number" id="discount" value="0" min="0">
                            <select id="discountType">
                                <option value="percentage">%</option>
                                <option value="amount">₹</option>
                            </select>
                        </div>
                    </div>
                    <div class="summary-row total">
                        <span>Total Amount</span>
                        <span id="totalAmount">₹0.00</span>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
                <div class="info-message">
                    <span>Fill all required fields before downloading</span>
                </div>
                <div class="buttons">
                    <button id="previewBtn" class="btn-outline">Preview</button>
                    <button id="downloadBtn" class="btn-primary">Download PDF</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Invoice Preview Modal -->
    <div id="previewModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Invoice Preview</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div id="invoicePreview"></div>
            </div>
            <div class="modal-footer">
                <button id="closePreviewBtn" class="btn-primary">Close</button>
            </div>
        </div>
    </div>
    
    <!-- Terms and Conditions Modal -->
    <div id="termsModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Terms and Conditions</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div id="termsContent">
                    <h3>Invoice Generator Terms of Use</h3>
                    <p>By using this invoice generator, you agree to the following terms and conditions:</p>
                    
                    <h4>1. General Terms</h4>
                    <p>This invoice generator is provided for creating invoices for legitimate business purposes only. You are responsible for ensuring that all information entered is accurate and complies with applicable laws and regulations.</p>
                    
                    <h4>2. Legal Compliance</h4>
                    <p>You agree to use this tool in compliance with all applicable tax laws and regulations in your jurisdiction. This includes proper reporting of sales tax, GST, VAT or other applicable taxes.</p>
                    
                    <h4>3. Data Privacy</h4>
                    <p>We do not store any information you enter. All data remains in your browser and is used only to generate the PDF invoice. No data is transmitted to our servers.</p>
                    
                    <h4>4. Disclaimer of Warranty</h4>
                    <p>This tool is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the service will be error-free or uninterrupted.</p>
                    
                    <h4>5. Limitation of Liability</h4>
                    <p>We shall not be liable for any direct, indirect, incidental, special, consequential or exemplary damages resulting from your use of this service.</p>
                    
                    <h4>6. Intellectual Property</h4>
                    <p>The design, layout, and functionality of this invoice generator are protected by copyright and other intellectual property laws.</p>
                    
                    <h4>7. Use of Generated Invoices</h4>
                    <p>You are solely responsible for the content of the invoices you generate and how you use them in your business operations.</p>
                </div>
            </div>
            <div class="modal-footer">
                <button id="closeTermsBtn" class="btn-primary">I Understand</button>
            </div>
        </div>
    </div>

    <!-- Load jsPDF library for PDF generation -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js"></script>
    
    <!-- Load app script -->
    <script src="scripts.js"></script>
</body>
</html>
