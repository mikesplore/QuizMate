import PyPDF2
from docx import Document
from PIL import Image
import pytesseract
import io
from typing import Tuple

class DocumentProcessor:
    @staticmethod
    def process_pdf(file_content: bytes) -> Tuple[str, int]:
        """Extract text from PDF file"""
        try:
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            page_count = len(pdf_reader.pages)
            
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n\n"
            
            return text.strip(), page_count
        except Exception as e:
            raise Exception(f"Error processing PDF: {str(e)}")
    
    @staticmethod
    def process_docx(file_content: bytes) -> Tuple[str, int]:
        """Extract text from DOCX file"""
        try:
            docx_file = io.BytesIO(file_content)
            doc = Document(docx_file)
            
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            
            # Approximate page count (assuming ~500 words per page)
            word_count = len(text.split())
            page_count = max(1, word_count // 500)
            
            return text.strip(), page_count
        except Exception as e:
            raise Exception(f"Error processing DOCX: {str(e)}")
    
    @staticmethod
    def process_image(file_content: bytes) -> Tuple[str, int]:
        """Extract text from image using OCR"""
        try:
            image = Image.open(io.BytesIO(file_content))
            text = pytesseract.image_to_string(image)
            return text.strip(), 1
        except Exception as e:
            raise Exception(f"Error processing image: {str(e)}")
    
    @staticmethod
    def process_txt(file_content: bytes) -> Tuple[str, int]:
        """Process plain text file"""
        try:
            text = file_content.decode('utf-8')
            # Approximate page count
            word_count = len(text.split())
            page_count = max(1, word_count // 500)
            return text.strip(), page_count
        except Exception as e:
            raise Exception(f"Error processing text file: {str(e)}")
    
    @classmethod
    def process_document(cls, file_content: bytes, document_type: str) -> Tuple[str, int]:
        """Process document based on type"""
        processors = {
            'pdf': cls.process_pdf,
            'docx': cls.process_docx,
            'txt': cls.process_txt,
            'image': cls.process_image,
            'png': cls.process_image,
            'jpg': cls.process_image,
            'jpeg': cls.process_image,
        }
        
        processor = processors.get(document_type.lower())
        if not processor:
            raise ValueError(f"Unsupported document type: {document_type}")
        
        return processor(file_content)
