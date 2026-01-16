import { jsPDF } from "jspdf";

export const generateMOU = (sponsor, event) => {
  const doc = new jsPDF();

  // 1. Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("MEMORANDUM OF UNDERSTANDING", 105, 20, null, null, "center");
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("This Sponsorship Agreement is made and entered into by:", 105, 30, null, null, "center");

  // 2. Parties
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("BETWEEN:", 20, 45);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Event Organizer: ${event.user?.name || "Campus Organizer"}`, 20, 55);
  doc.text(`Contact: ${event.contactEmail || "N/A"}`, 20, 62);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("AND:", 120, 45);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Sponsor: ${sponsor.name}`, 120, 55);
  doc.text(`Company: ${sponsor.companyName || "N/A"}`, 120, 62);

  doc.line(20, 70, 190, 70);

  // 3. Event Details
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("1. EVENT DETAILS", 20, 80);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Event Name: ${event.title}`, 20, 90);
  doc.text(`Date: ${new Date(event.date).toDateString()}`, 20, 98);
  doc.text(`Location: ${event.location}`, 20, 106);

  // 4. Sponsorship Amount
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("2. SPONSORSHIP CONTRIBUTION", 20, 120);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`The Sponsor agrees to contribute a sum of INR ${sponsor.amount}.`, 20, 130);
  doc.text(`Payment Status: ${sponsor.status.toUpperCase()}`, 20, 138);
  doc.text(`Payment ID: ${sponsor.paymentId || "N/A"}`, 20, 146);

  // 5. Terms
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("3. TERMS & CONDITIONS", 20, 160);

  doc.setFontSize(10);
  doc.text("- The Organizer agrees to display the Sponsor's logo on event banners.", 25, 170);
  doc.text("- The Sponsor has paid the full amount via the CampusSponsor platform.", 25, 178);
  doc.text("- This agreement is binding and serves as proof of sponsorship.", 25, 186);

  // 6. Signatures Section
  doc.text("__________________________", 20, 230);
  doc.text("Authorized Signature", 20, 235);
  doc.text("(Organizer)", 20, 240);

  doc.text("__________________________", 130, 230);
  doc.text("Authorized Signature", 130, 235);
  doc.text("(Sponsor)", 130, 240);

  // 7. Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Generated via CampusSponsor Platform", 105, 280, null, null, "center");

  // Save File
  doc.save(`${sponsor.name}_MOU.pdf`);
};