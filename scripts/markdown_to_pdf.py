import sys, os

def text_to_pdf(text, out_file):
    lines = text.splitlines()
    y = 800  # starting y position
    pdf_lines = ["BT", "/F1 12 Tf"]
    for line in lines:
        safe = line.replace('(', '\\(').replace(')', '\\)')
        pdf_lines.append(f"1 0 0 1 50 {y} Tm ({safe}) Tj")
        y -= 14
    pdf_lines.append("ET")
    stream_data = "\n".join(pdf_lines)
    obj4 = f"4 0 obj\n<< /Length {len(stream_data)} >>\nstream\n{stream_data}\nendstream\nendobj\n"
    objects = []
    objects.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    objects.append("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    objects.append("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n")
    objects.append(obj4)
    objects.append("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
    offsets = []
    pdf = "%PDF-1.4\n"
    for obj in objects:
        offsets.append(len(pdf))
        pdf += obj
    xref_pos = len(pdf)
    pdf += f"xref\n0 {len(objects)+1}\n"
    pdf += "0000000000 65535 f \n"
    for off in offsets:
        pdf += f"{off:010d} 00000 n \n"
    pdf += f"trailer\n<< /Root 1 0 R /Size {len(objects)+1} >>\nstartxref\n{xref_pos}\n%%EOF"
    with open(out_file, 'wb') as f:
        f.write(pdf.encode('latin1'))

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Usage: markdown_to_pdf.py <input.md> <output.pdf>')
        sys.exit(1)
    with open(sys.argv[1], 'r') as f:
        text = f.read()
    text_to_pdf(text, sys.argv[2])
