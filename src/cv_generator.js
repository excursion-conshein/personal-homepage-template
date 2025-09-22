// Written by Constantine Heinrich Chen (ConsHein Chen)
// Last Change: 2025-09-19

// CV Generator using pdf-lib library
let pdfLib = null;

// Initialize pdf-lib library
function initializePdfLib() {
    if (typeof PDFDocument !== 'undefined') {
        pdfLib = { PDFDocument: PDFDocument };
        if (typeof PDFLib !== 'undefined') {
            pdfLib.rgb = PDFLib.rgb;
            pdfLib.StandardFonts = PDFLib.StandardFonts;
        }
        return true;
    }
    
    if (typeof PDFLib !== 'undefined' && PDFLib.PDFDocument) {
        pdfLib = { 
            PDFDocument: PDFLib.PDFDocument, 
            rgb: PDFLib.rgb, 
            StandardFonts: PDFLib.StandardFonts 
        };
        return true;
    }
    
    if (window.PDFDocument) {
        pdfLib = { PDFDocument: window.PDFDocument };
        if (window.PDFLib) {
            pdfLib.rgb = window.PDFLib.rgb;
            pdfLib.StandardFonts = window.PDFLib.StandardFonts;
        }
        return true;
    }
    
    return false;
}

// Generate PDF with minimal processing
async function generatePDF() {
    if (!pdfLib) return null;
    
    try {
        const pdfDoc = await pdfLib.PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        
        // Get fonts - use standard fonts
        const titleFont = await pdfDoc.embedFont(pdfLib.StandardFonts.HelveticaBold);
        const bodyFont = await pdfDoc.embedFont(pdfLib.StandardFonts.Helvetica);
        
        // Content
        const title = 'Excursion Information';
        const subtitle = 'This is a test document';
        const content = 'This is a PDF document generated using the pdf-lib library.';
        
        // Draw content
        page.drawText(title, { x: 50, y: 700, size: 24, font: titleFont, color: pdfLib.rgb(0, 0, 0) });
        page.drawText(subtitle, { x: 50, y: 660, size: 18, font: bodyFont, color: pdfLib.rgb(0, 0, 0) });
        page.drawText(content, { x: 50, y: 600, size: 12, font: bodyFont, color: pdfLib.rgb(0, 0, 0), maxWidth: 500, lineHeight: 16 });
        
        // Sections
        const sections = [
            { title: 'Education', content: '• Bachelor of Computer Science\n• Master of Software Engineering' },
            { title: 'Work Experience', content: '• Software Engineer (2020-Present)\n• Frontend Developer Intern (2019-2020)' },
            { title: 'Skills', content: '• JavaScript, TypeScript, HTML/CSS\n• React, Vue, Node.js\n• Python, Java, C++' }
        ];
        
        let yPos = 500;
        for (const section of sections) {
            page.drawText(section.title, { x: 50, y: yPos, size: 16, font: titleFont, color: pdfLib.rgb(0, 0, 0) });
            page.drawText(section.content, { x: 50, y: yPos - 30, size: 12, font: bodyFont, color: pdfLib.rgb(0, 0, 0), maxWidth: 500, lineHeight: 16 });
            yPos -= 100;
        }
        
        // Date
        const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        page.drawText(`Generated on: ${currentDate}`, { x: 450, y: 50, size: 10, font: bodyFont, color: pdfLib.rgb(0.5, 0.5, 0.5) });
        
        return await pdfDoc.save();
    } catch (error) {
        console.error('Error generating PDF:', error);
        return null;
    }
}

// Download PDF with async processing
async function downloadPDF() {
    console.log('downloadPDF called');
    
    if (!pdfLib) {
        console.error('PDF library not loaded');
        alert('PDF library not loaded. Please try refreshing the page.');
        return;
    }
    
    // Show loading indicator
    const button = document.getElementById('generate-cv-btn');
    if (button) {
        const originalText = button.textContent;
        button.textContent = 'Generating...';
        button.disabled = true;
        
        try {
            console.log('Generating PDF...');
            const pdfBytes = await generatePDF();
            
            if (!pdfBytes) {
                console.error('Failed to generate PDF bytes');
                alert('Failed to generate PDF. Please try again.');
                return;
            }
            
            console.log('PDF generated, creating blob...');
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'excursion-information.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log('PDF download initiated');
        } finally {
            // Restore button state
            button.textContent = originalText;
            button.disabled = false;
        }
    }
}

// Initialize
function initCVGenerator() {
    const button = document.getElementById('generate-cv-btn');
    if (button) {
        button.addEventListener('click', downloadPDF);
    }
}

// Start when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (initializePdfLib()) {
            initCVGenerator();
        } else {
            let attempts = 0;
            const checkInterval = setInterval(function() {
                attempts++;
                if (initializePdfLib()) {
                    clearInterval(checkInterval);
                    initCVGenerator();
                } else if (attempts >= 20) {
                    clearInterval(checkInterval);
                    initCVGenerator();
                }
            }, 1000);
        }
    });
} else {
    if (initializePdfLib()) {
        initCVGenerator();
    } else {
        let attempts = 0;
        const checkInterval = setInterval(function() {
            attempts++;
            if (initializePdfLib()) {
                clearInterval(checkInterval);
                initCVGenerator();
            } else if (attempts >= 20) {
                clearInterval(checkInterval);
                initCVGenerator();
            }
        }, 1000);
    }
}