import { jsPDF } from "jspdf";

export const generateMOU = (sponsor, event) => {
  const doc = new jsPDF();

  // --- 1. HEADER DESIGN (Branding) ---
  doc.setFillColor(37, 99, 235); // Blue Color (Tera Brand Color)
  doc.rect(0, 0, 210, 40, 'F'); // Top Header Bar

  doc.setTextColor(255, 255, 255); // White Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("MEMORANDUM OF UNDERSTANDING", 105, 20, null, null, "center");
  doc.setFontSize(10);
  doc.text("Official Sponsorship Agreement | Campus Sponsor", 105, 30, null, null, "center");

  // Reset Colors for Body
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  // --- 2. DOCUMENT INFO ---
  doc.setFontSize(10);
  const date = new Date().toLocaleDateString();
  const refNo = `MOU-${event._id.slice(-6).toUpperCase()}-${sponsor.paymentId ? sponsor.paymentId.slice(-4) : 'CASH'}`;
  
  doc.text(`Date: ${date}`, 20, 50);
  doc.text(`Ref No: ${refNo}`, 140, 50);

  // Line Separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 55, 190, 55);

  // --- 3. PARTIES INVOLVED ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("BETWEEN:", 20, 65);

  // Event Organizer (Party A)
  doc.setFont("helvetica", "bold");
  doc.text("1. THE ORGANIZER:", 20, 75);
  doc.setFont("helvetica", "normal");
  doc.text(`Event Name: ${event.title}`, 30, 82);
  doc.text(`Organized By: ${event.user?.name || "Student Committee"}`, 30, 88);
  doc.text(`Location: ${event.location}`, 30, 94);

  // Sponsor (Party B)
  doc.setFont("helvetica", "bold");
  doc.text("2. THE SPONSOR:", 110, 75);
  doc.setFont("helvetica", "normal");
  doc.text(`Company/Name: ${sponsor.companyName || sponsor.name}`, 120, 82);
  doc.text(`Email: ${sponsor.email}`, 120, 88);
  doc.text(`Sponsorship Amount: INR ${sponsor.amount}`, 120, 94);

  // --- 4. AGREEMENT BODY ---
  doc.setFont("helvetica", "bold");
  doc.text("TERMS OF AGREEMENT:", 20, 110);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const terms = [
    "1. PURPOSE: The Sponsor agrees to provide funds to the Organizer for the purpose of supporting the above-mentioned event.",
    "2. DELIVERABLES: The Organizer agrees to provide branding visibility (banners, logos, mentions) as per the sponsorship tier selected.",
    "3. PAYMENT: The Sponsor confirms that the payment of INR " + sponsor.amount + " has been successfully transferred via Campus Sponsor Platform.",
    "4. CANCELLATION: In case of event cancellation, the Organizer is liable to refund 80% of the sponsorship amount within 7 working days.",
    "5. JURISDICTION: This agreement is generated electronically and is valid under the IT Act of India."
  ];

  let yPos = 120;
  terms.forEach((term) => {
    const splitText = doc.splitTextToSize(term, 170); // Wrap text
    doc.text(splitText, 20, yPos);
    yPos += (splitText.length * 5) + 5;
  });

  // --- 5. PAYMENT PROOF ---
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1);
  doc.rect(20, yPos + 10, 170, 30); // Box
  
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT STATUS: VERIFIED ✅", 105, yPos + 22, null, null, "center");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Transaction ID: ${sponsor.paymentId || "Manual / Cash Verification"}`, 105, yPos + 30, null, null, "center");

  // --- 6. SIGNATURES (Digital) ---
  const signY = 240;
  
  // Organizer Sign
  doc.line(30, signY, 80, signY);
  doc.text("Authorized Signatory", 35, signY + 5);
  doc.text("(Organizer)", 40, signY + 10);

  // Sponsor Sign
  doc.line(130, signY, 180, signY);
  doc.text("Authorized Signatory", 135, signY + 5);
  doc.text("(Sponsor)", 145, signY + 10);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Generated automatically by Campus Sponsor App. No physical signature required.", 105, 280, null, null, "center");

  // Save PDF
  doc.save(`${sponsor.name}_MOU.pdf`);
};