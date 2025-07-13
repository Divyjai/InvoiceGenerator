/**
 * Invoice Generator - Single file JavaScript implementation
 */

// Currency symbol mapping
const currencySymbols = {
    'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥'
};

document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    document.getElementById('invoiceDate').value = new Date().toISOString().split('T')[0];
    
    // Add first empty item row
    addItemRow();
    
    // Event Listeners
    document.getElementById('addItemBtn').addEventListener('click', addItemRow);
    document.getElementById('itemsTable').addEventListener('click', handleTableClick);
    document.getElementById('itemsTable').addEventListener('input', handleTableInput);
    document.getElementById('previewBtn').addEventListener('click', handlePreview);
    document.getElementById('downloadBtn').addEventListener('click', handleDownload);
    document.querySelector('.close').addEventListener('click', closePreviewModal);
    document.getElementById('closePreviewBtn').addEventListener('click', closePreviewModal);
    document.getElementById('currency').addEventListener('change', updateCalculations);
    document.getElementById('discount').addEventListener('input', updateCalculations);
    document.getElementById('discountType').addEventListener('change', updateCalculations);
    
    // Terms and conditions modal handlers
    document.getElementById('termsLink').addEventListener('click', openTermsModal);
    document.querySelector('#termsModal .close').addEventListener('click', closeTermsModal);
    document.getElementById('closeTermsBtn').addEventListener('click', closeTermsModal);
    
    // Update download button state based on terms checkbox
    document.getElementById('termsConditions').addEventListener('change', function() {
        updateDownloadButtonState();
    });
    
    // Initial calculations and UI updates
    updateCalculations();
    updateDownloadButtonState();
});

// Add new item row to table
function addItemRow() {
    const tbody = document.querySelector('#itemsTable tbody');
    const newRow = document.createElement('tr');
    
    // Add animation class
    newRow.classList.add('animate-slide');
    
    newRow.innerHTML = `
        <td><input type="text" class="item-name" placeholder="Item name"></td>
        <td><input type="text" class="item-description" placeholder="Description"></td>
        <td><input type="number" class="item-quantity" value="1" min="1"></td>
        <td><input type="number" class="item-price" value="0" min="0" step="0.01"></td>
        <td><span class="line-total">₹0.00</span></td>
        <td><button type="button" class="delete-btn delete-item">×</button></td>
    `;
    
    tbody.appendChild(newRow);
    
    // Focus on the first input of the new row
    setTimeout(() => {
        const firstInput = newRow.querySelector('.item-name');
        if (firstInput) firstInput.focus();
    }, 100);
    
    updateCalculations();
}

// Handle clicks on table (for delete button) with animation
function handleTableClick(e) {
    if (e.target.classList.contains('delete-btn') || e.target.parentElement.classList.contains('delete-btn')) {
        const row = e.target.closest('tr');
        const allRows = document.querySelectorAll('#itemsTable tbody tr');
        
        if (allRows.length > 1) {
            // Add fade-out effect
            row.style.transition = 'all 0.3s';
            row.style.opacity = '0';
            row.style.transform = 'translateX(10px)';
            
            // Remove after animation completes
            setTimeout(() => {
                row.remove();
                updateCalculations();
            }, 300);
        }
    }
}

// Handle input on table (for quantity/price changes)
function handleTableInput(e) {
    if (e.target.classList.contains('item-quantity') || e.target.classList.contains('item-price')) {
        updateCalculations();
    }
}

// Calculate and update all invoice values
function updateCalculations() {
    // Get current currency
    const currencyCode = document.getElementById('currency').value;
    const currencySymbol = currencySymbols[currencyCode] || '₹';
    
    // Update currency symbol in discount type dropdown
    document.querySelector('#discountType option[value="amount"]').textContent = currencySymbol;
    
    // Function to format money values without unnecessary decimals
    const formatMoney = (value) => {
        return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    };
    
    // Get all items from the table
    const items = [];
    const rows = document.querySelectorAll('#itemsTable tbody tr');
    
    rows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const lineTotal = quantity * price;
        
        items.push({
            name: row.querySelector('.item-name').value,
            description: row.querySelector('.item-description').value,
            quantity: quantity,
            price: price
        });
        
        // Update line total
        row.querySelector('.line-total').textContent = `${currencySymbol}${formatMoney(lineTotal)}`;
    });
    
    // Calculate values
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    
    const discountValue = parseFloat(document.getElementById('discount').value) || 0;
    const discountType = document.getElementById('discountType').value;
    const discount = discountType === 'percentage' ? (subtotal * discountValue / 100) : discountValue;
    
    const total = subtotal + cgst + sgst - discount;
    
    // Update UI
    document.getElementById('subtotal').textContent = `${currencySymbol}${formatMoney(subtotal)}`;
    document.getElementById('cgst').textContent = `${currencySymbol}${formatMoney(cgst)}`;
    document.getElementById('sgst').textContent = `${currencySymbol}${formatMoney(sgst)}`;
    document.getElementById('totalAmount').textContent = `${currencySymbol}${formatMoney(total)}`;
}

// Validation before preview or download
function validateInvoice() {
    if (!document.getElementById('sellerName').value || !document.getElementById('clientName').value) {
        return false;
    }
    
    const items = document.querySelectorAll('#itemsTable tbody tr');
    if (items.length === 0) return false;
    
    let validItems = false;
    items.forEach(item => {
        const name = item.querySelector('.item-name').value;
        const price = parseFloat(item.querySelector('.item-price').value);
        if (name && price > 0) validItems = true;
    });
    
    return validItems;
}

// Preview button handler
function handlePreview() {
    if (!validateInvoice()) {
        alert('Please fill in all required fields before preview.');
        return;
    }
    openPreviewModal();
}

// Download button handler
function handleDownload() {
    if (!document.getElementById('termsConditions').checked) {
        alert('Please accept the terms and conditions before downloading.');
        return;
    }
    
    if (!validateInvoice()) {
        alert('Please fill in all required fields before downloading.');
        return;
    }
    
    generatePDF();
}

// Open preview modal with invoice data
function openPreviewModal() {
    const invoiceData = getInvoiceData();
    const previewElement = document.getElementById('invoicePreview');
    
    // Function to format money values without unnecessary decimals
    const formatMoney = (value) => {
        return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    };
    
    // Create HTML for preview with enhanced styling
    previewElement.innerHTML = `
        <div class="invoice-preview animate-fade">
            <div class="invoice-meta">
                <div>
                    <h2>${invoiceData.sellerName || "[Your Name]"}</h2>
                    <p>${invoiceData.sellerProfession || ""}</p>
                    ${invoiceData.sellerEmail ? `<p>${invoiceData.sellerEmail}</p>` : ''}
                </div>
                <div style="text-align: right;">
                    <h2 style="background-image: var(--primary-gradient); -webkit-background-clip: text; background-clip: text; color: transparent;">INVOICE</h2>
                    <p>${invoiceData.invoiceNumber}</p>
                    <p>Date: ${invoiceData.invoiceDate}</p>
                </div>
            </div>
            
            <div class="parties">
                <div class="party-box">
                    <h3>From:</h3>
                    <p><strong>${invoiceData.sellerName || ""}</strong></p>
                    <p>${invoiceData.sellerProfession || ""}</p>
                    ${invoiceData.sellerEmail ? `<p>${invoiceData.sellerEmail}</p>` : ''}
                </div>
                
                <div class="party-box">
                    <h3>Bill To:</h3>
                    <p><strong>${invoiceData.clientName || ""}</strong></p>
                    <p>${invoiceData.clientAddress || ""}</p>
                    ${invoiceData.clientEmail ? `<p>${invoiceData.clientEmail}</p>` : ''}
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Description</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoiceData.items.map(item => `
                        <tr>
                            <td>${item.name || ""}</td>
                            <td>${item.description || ""}</td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td style="text-align: right;">${invoiceData.currencySymbol}${formatMoney(item.price)}</td>
                            <td style="text-align: right;">${invoiceData.currencySymbol}${formatMoney(item.quantity * item.price)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="invoice-summary-section">
                <div class="invoice-summary-box">
                    <div class="summary-row">
                        <span class="label">Subtotal:</span>
                        <span>${invoiceData.currencySymbol}${formatMoney(invoiceData.subtotal)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="label">CGST (9%):</span>
                        <span>${invoiceData.currencySymbol}${formatMoney(invoiceData.cgst)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="label">SGST (9%):</span>
                        <span>${invoiceData.currencySymbol}${formatMoney(invoiceData.sgst)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="label">Discount:</span>
                        <span>${invoiceData.currencySymbol}${formatMoney(invoiceData.discount)}</span>
                    </div>
                    <div class="summary-row total">
                        <span class="label">Total:</span>
                        <span>${invoiceData.currencySymbol}${formatMoney(invoiceData.total)}</span>
                    </div>
                </div>
            </div>
            
            ${invoiceData.notes ? `
                <div class="notes">
                    <h4>Notes:</h4>
                    <p>${invoiceData.notes}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    // Show the modal with animation
    const modal = document.getElementById('previewModal');
    modal.style.display = 'block';
    
    // Trigger reflow to ensure CSS transition works
    void modal.offsetWidth;
    
    // Add show class for animation
    modal.classList.add('show');
}

// Close preview modal
function closePreviewModal() {
    const modal = document.getElementById('previewModal');
    
    // Remove show class to trigger transition out
    modal.classList.remove('show');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // Match this with the CSS transition time
}

// Get all invoice data from form
function getInvoiceData() {
    const currencyCode = document.getElementById('currency').value;
    const currencySymbol = currencySymbols[currencyCode] || '₹';
    
    // Get all items from the table
    const items = [];
    const rows = document.querySelectorAll('#itemsTable tbody tr');
    
    rows.forEach(row => {
        items.push({
            name: row.querySelector('.item-name').value,
            description: row.querySelector('.item-description').value,
            quantity: parseFloat(row.querySelector('.item-quantity').value) || 0,
            price: parseFloat(row.querySelector('.item-price').value) || 0
        });
    });
    
    // Calculate values
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    
    const discountValue = parseFloat(document.getElementById('discount').value) || 0;
    const discountType = document.getElementById('discountType').value;
    const discount = discountType === 'percentage' ? (subtotal * discountValue / 100) : discountValue;
    
    const total = subtotal + cgst + sgst - discount;
    
    return {
        // Basic details
        invoiceNumber: document.getElementById('invoiceNo').value,
        invoiceDate: document.getElementById('invoiceDate').value,
        currency: currencyCode,
        currencySymbol: currencySymbol,
        
        // Seller info
        sellerName: document.getElementById('sellerName').value,
        sellerProfession: document.getElementById('sellerProfession').value,
        sellerEmail: document.getElementById('sellerEmail').value,
        
        // Client info
        clientName: document.getElementById('clientName').value,
        clientAddress: document.getElementById('clientAddress').value,
        clientEmail: document.getElementById('clientEmail').value,
        
        // Items and calculations
        items: items,
        notes: document.getElementById('notes').value,
        subtotal: subtotal,
        cgst: cgst,
        sgst: sgst,
        discount: discount,
        discountType: discountType,
        total: total
    };
}

// Open terms and conditions modal
function openTermsModal(e) {
    e.preventDefault();
    const modal = document.getElementById('termsModal');
    modal.style.display = 'block';
    
    // Trigger reflow to ensure CSS transition works
    void modal.offsetWidth;
    
    // Add show class for animation
    modal.classList.add('show');
}

// Close terms and conditions modal
function closeTermsModal() {
    const modal = document.getElementById('termsModal');
    
    // Remove show class to trigger transition out
    modal.classList.remove('show');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // Match this with the CSS transition time
}

// Update download button state
function updateDownloadButtonState() {
    const termsChecked = document.getElementById('termsConditions').checked;
    const downloadBtn = document.getElementById('downloadBtn');
    
    if (termsChecked) {
        downloadBtn.removeAttribute('disabled');
        downloadBtn.classList.remove('btn-disabled');
        downloadBtn.classList.add('btn-primary');
    } else {
        downloadBtn.setAttribute('disabled', 'disabled');
        downloadBtn.classList.add('btn-disabled');
        downloadBtn.classList.remove('btn-primary');
    }
}

// Generate PDF invoice
function generatePDF() {
    const invoiceData = getInvoiceData();
    
    // Create new PDF document
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add Invoice Title
    doc.setFontSize(24);
    doc.setTextColor(70, 70, 195);
    doc.text("INVOICE", 105, 20, { align: "center" });
    
    // Add Invoice Details
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 155, 30, { align: "right" });
    doc.text(`Date: ${invoiceData.invoiceDate}`, 155, 35, { align: "right" });
    
    // Seller Info
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.setFont("helvetica", "bold");
    doc.text("From:", 20, 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(invoiceData.sellerName || "[Your Name/Business]", 20, 35);
    doc.setFontSize(10);
    doc.setTextColor(100);
    if (invoiceData.sellerProfession) {
        doc.text(invoiceData.sellerProfession, 20, 40);
    }
    if (invoiceData.sellerEmail) {
        doc.text(invoiceData.sellerEmail, 20, invoiceData.sellerProfession ? 45 : 40);
    }
    
    // Client Info
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 20, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(invoiceData.clientName || "[Client Name]", 20, 65);
    doc.setFontSize(10);
    doc.setTextColor(100);
    
    let yPos = 70;
    if (invoiceData.clientAddress) {
        const clientAddressLines = invoiceData.clientAddress.split('\n');
        clientAddressLines.forEach(line => {
            doc.text(line, 20, yPos);
            yPos += 5;
        });
    }
    
    if (invoiceData.clientEmail) {
        doc.text(invoiceData.clientEmail, 20, yPos);
        yPos += 5;
    }
    
    // Item Table
    const tableColumn = ["Item", "Description", "Qty", "Price", "Total"];
    
    // Function to format money values without unnecessary decimals
    const formatMoney = (value) => {
        return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    };
    
    const tableRows = invoiceData.items.map(item => [
        item.name || "",
        item.description || "",
        item.quantity.toString(),
        `${invoiceData.currencySymbol}${formatMoney(item.price)}`,
        `${invoiceData.currencySymbol}${formatMoney(item.quantity * item.price)}`
    ]);
    
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: yPos + 5,
        theme: 'striped',
        headStyles: { 
            fillColor: [70, 70, 195],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 60 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 30, halign: 'right' },
        },
    });
    
    // Get the last Y position after the table
    const finalY = doc.lastAutoTable.finalY || 120;
    
    // Summary
    const summaryX = 130;
    let summaryY = finalY + 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    
    doc.text("Subtotal:", summaryX, summaryY);
    doc.text(`${invoiceData.currencySymbol}${formatMoney(invoiceData.subtotal)}`, 190, summaryY, { align: "right" });
    summaryY += 6;
    
    doc.text("CGST (9%):", summaryX, summaryY);
    doc.text(`${invoiceData.currencySymbol}${formatMoney(invoiceData.cgst)}`, 190, summaryY, { align: "right" });
    summaryY += 6;
    
    doc.text("SGST (9%):", summaryX, summaryY);
    doc.text(`${invoiceData.currencySymbol}${formatMoney(invoiceData.sgst)}`, 190, summaryY, { align: "right" });
    summaryY += 6;
    
    doc.text("Discount:", summaryX, summaryY);
    doc.text(`${invoiceData.currencySymbol}${formatMoney(invoiceData.discount)}`, 190, summaryY, { align: "right" });
    summaryY += 6;
    
    doc.setLineWidth(0.5);
    doc.line(summaryX, summaryY, 190, summaryY);
    summaryY += 4;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60);
    doc.text("Total:", summaryX, summaryY + 2);
    doc.text(`${invoiceData.currencySymbol}${formatMoney(invoiceData.total)}`, 190, summaryY + 2, { align: "right" });
    
    // Notes
    if (invoiceData.notes) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Notes:", 20, finalY + 15);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(invoiceData.notes, 20, finalY + 22);
    }
    
    // Save the PDF
    const fileName = `${invoiceData.invoiceNumber.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    doc.save(fileName);
}
