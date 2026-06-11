export const printReceiptHtml = (htmlContent) => {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) {
    alert('Please allow popups for printing receipts');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Receipt</title>
        <style>
          @page { margin: 0; size: 80mm auto; }
          body { 
            margin: 0; 
            padding: 0;
            background: #fff;
          }
          /* Hide scrollbar */
          ::-webkit-scrollbar { display: none; }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => {
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
