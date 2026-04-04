from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from io import BytesIO
import os
import json

def generate_pass_pdf(
    template_path: str,
    qr_code_path: str,
    member_data: dict,
    output_path: str,
    coordinates: dict = None,
    text_elements: str = None
) -> str:
    """Generate PDF pass by overlaying QR and text on template"""
    
    # Default coordinates
    if coordinates is None:
        coordinates = {
            'qr_x': 30,
            'qr_y': 30,
            'qr_size': 100,
            'text_x': 200,
            'text_y': 100
        }
    
    # Read template to get page size
    template_pdf = PdfReader(template_path)
    template_page = template_pdf.pages[0]
    page_width = float(template_page.mediabox.width)
    page_height = float(template_page.mediabox.height)
    
    print(f"Template size: {page_width} x {page_height}")
    print(f"Text elements: {text_elements}")
    
    # Create overlay with same size as template
    packet = BytesIO()
    can = canvas.Canvas(packet, pagesize=(page_width, page_height))
    
    # Draw QR code
    if os.path.exists(qr_code_path):
        # Convert Y coordinate (canvas uses top-left, PDF uses bottom-left)
        qr_y_pdf = page_height - coordinates['qr_y'] - coordinates['qr_size']
        can.drawImage(
            qr_code_path,
            coordinates['qr_x'],
            qr_y_pdf,
            width=coordinates['qr_size'],
            height=coordinates['qr_size'],
            mask='auto'
        )
    
    # Draw text elements if provided
    if text_elements:
        try:
            elements = json.loads(text_elements)
            print(f"Rendering {len(elements)} text elements")
            
            for element in elements:
                # Get field value
                field = element.get('field', 'custom')
                if field == 'name':
                    text = member_data.get('name', '')
                elif field == 'team_name':
                    text = member_data.get('team_name', '')
                elif field == 'team_id':
                    text = member_data.get('team_id', '')
                elif field == 'status':
                    text = member_data.get('status', '')
                elif field == 'email':
                    text = member_data.get('email', '')
                else:
                    # Custom text with placeholders
                    text = element.get('text', '')
                    # Replace placeholders with actual data
                    text = text.replace('{Name}', member_data.get('name', ''))
                    text = text.replace('{Team Name}', member_data.get('team_name', ''))
                    text = text.replace('{Team ID}', member_data.get('team_id', ''))
                    text = text.replace('{Status}', member_data.get('status', ''))
                    text = text.replace('{Email}', member_data.get('email', ''))
                    # Also support lowercase
                    text = text.replace('{name}', member_data.get('name', ''))
                    text = text.replace('{team name}', member_data.get('team_name', ''))
                    text = text.replace('{team id}', member_data.get('team_id', ''))
                    text = text.replace('{status}', member_data.get('status', ''))
                    text = text.replace('{email}', member_data.get('email', ''))
                
                print(f"Drawing text '{text}' at ({element.get('x')}, {element.get('y')})")
                
                # Set font
                font_family = element.get('fontFamily', 'Helvetica')
                font_weight = element.get('fontWeight', 'normal')
                font_name = font_family if font_weight == 'normal' else f"{font_family}-Bold"
                font_size = element.get('fontSize', 14)
                
                try:
                    can.setFont(font_name, font_size)
                except:
                    can.setFont("Helvetica", font_size)
                
                # Set color
                color = element.get('color', '#ffffff')
                try:
                    hex_color = HexColor(color)
                    can.setFillColor(hex_color)
                except:
                    can.setFillColorRGB(1, 1, 1)
                
                # Get position
                x = element.get('x', 0)
                y = element.get('y', 0)
                height = element.get('height', 30)
                
                # Convert Y coordinate (canvas uses top-left, PDF uses bottom-left)
                y_pdf = page_height - y - height
                
                # Draw text with vertical centering
                can.drawString(x + 5, y_pdf + height/2 - font_size/3, text)
                
        except Exception as e:
            print(f"Error rendering text elements: {e}")
            import traceback
            traceback.print_exc()
            # Fallback to default text rendering
            can.setFillColorRGB(1, 1, 1)
            can.setFont("Helvetica-Bold", 16)
            can.drawString(coordinates['text_x'], page_height - coordinates['text_y'] - 40, member_data.get('name', ''))
    else:
        print("No text elements, using fallback")
        # Fallback: Draw default text (white color)
        can.setFillColorRGB(1, 1, 1)
        
        # Convert Y coordinates
        text_y_pdf = page_height - coordinates['text_y']
        
        # Member name
        can.setFont("Helvetica-Bold", 16)
        can.drawString(coordinates['text_x'], text_y_pdf + 40, member_data.get('name', ''))
        
        # Team info
        can.setFont("Helvetica", 12)
        can.drawString(coordinates['text_x'], text_y_pdf + 20, f"Team: {member_data.get('team_name', '')} ({member_data.get('team_id', '')})")
        
        # Status
        can.drawString(coordinates['text_x'], text_y_pdf, f"Status: {member_data.get('status', '')}")
    
    can.save()
    packet.seek(0)
    
    # Read template and overlay
    overlay = PdfReader(packet)
    output = PdfWriter()
    
    page = template_page
    page.merge_page(overlay.pages[0])
    output.add_page(page)
    
    # Save output
    with open(output_path, "wb") as output_file:
        output.write(output_file)
    
    return output_path
