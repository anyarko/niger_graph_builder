import zipfile
import xml.etree.ElementTree as ET
import os

def extract_text_from_docx(docx_path, out_txt_path):
    print(f"Extracting {docx_path}...")
    try:
        with zipfile.ZipFile(docx_path, 'r') as z:
            xml_content = z.read('word/document.xml')
        
        tree = ET.fromstring(xml_content)
        # Namespace for Word XML
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        paragraphs = tree.findall('.//w:p', ns)
        
        texts = []
        for p in paragraphs:
            # Find all text nodes in the paragraph
            texts_in_p = p.findall('.//w:t', ns)
            p_text = "".join(t.text for t in texts_in_p if t.text)
            if p_text.strip():
                texts.append(p_text.strip())
                
        with open(out_txt_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(texts))
        print(f"Successfully extracted {len(texts)} lines to {out_txt_path}")
    except Exception as e:
        print(f"Failed to extract {docx_path}: {e}")

extract_text_from_docx('../Key Vulnerability Questions.docx', 'raw_text_en.txt')
extract_text_from_docx('../Translated - Sibling Method Survey Questions.docx', 'raw_text_fr.txt')
