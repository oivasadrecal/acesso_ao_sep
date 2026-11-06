import os
import csv
import zipfile

def create_csv_and_xlsx():
    target_dir = r"c:\Users\lacer\OneDrive\Documents\acesso_a_rede\doc_acesso_a_rede"
    os.makedirs(target_dir, exist_ok=True)

    csv_path = os.path.join(target_dir, "controle_acesso_rede.csv")
    xlsx_path = os.path.join(target_dir, "controle_acesso_rede.xlsx")

    headers = [
        "Data/Hora Registro",
        "Matrícula",
        "Nome Completo",
        "Função",
        "Unidade / Gerência",
        "Data Emissão",
        "Validade Cartão (NR10)",
        "NR10 BTS (0-4)",
        "NR10 BTC (0-4)",
        "NR10 ATS (0-4)",
        "NR10 ATC (0-4)",
        "NR11/12 Autorizado Operar",
        "NR33 Aut. Espaço Confinado",
        "NR33 Vigia",
        "NR33 Supervisor Entrada",
        "NR33 Validade",
        "NR35 Trabalho Altura",
        "NR35 Validade"
    ]

    initial_rows = []

    # Writing CSV with UTF-8 BOM so Excel opens it with correct encoding
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(headers)
        writer.writerows(initial_rows)

    print(f"CSV criado com sucesso: {csv_path}")

    # Create minimal XLSX zip archive
    create_xlsx(xlsx_path, [headers] + initial_rows)
    print(f"XLSX criado com sucesso: {xlsx_path}")

def create_xlsx(filepath, rows):
    def escape_xml(s):
        return (str(s)
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace('"', "&quot;"))

    # Shared Strings
    strings = []
    string_map = {}

    def get_string_index(s):
        s = str(s)
        if s not in string_map:
            string_map[s] = len(strings)
            strings.append(s)
        return string_map[s]

    # Pre-build shared strings table
    sheet_data_rows = []
    for r_idx, row in enumerate(rows, 1):
        cell_xmls = []
        for c_idx, val in enumerate(row, 1):
            col_letter = get_column_letter(c_idx)
            s_idx = get_string_index(val)
            cell_xmls.append(f'<c r="{col_letter}{r_idx}" t="s"><v>{s_idx}</v></c>')
        sheet_data_rows.append(f'<row r="{r_idx}">{"".join(cell_xmls)}</row>')

    sst_entries = "".join([f'<si><t>{escape_xml(s)}</t></si>' for s in strings])
    sst_xml = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="{len(strings)}" uniqueCount="{len(strings)}">{sst_entries}</sst>'

    sheet_xml = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>{"".join(sheet_data_rows)}</sheetData></worksheet>'

    content_types_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>'

    rels_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'

    workbook_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Controle Acesso Rede" sheetId="1" r:id="rId1"/></sheets></workbook>'

    workbook_rels_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>'

    with zipfile.ZipFile(filepath, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types_xml)
        z.writestr("_rels/.rels", rels_xml)
        z.writestr("xl/workbook.xml", workbook_xml)
        z.writestr("xl/_rels/workbook.xml.rels", workbook_rels_xml)
        z.writestr("xl/worksheets/sheet1.xml", sheet_xml)
        z.writestr("xl/sharedStrings.xml", sst_xml)

def get_column_letter(col_idx):
    result = ""
    while col_idx > 0:
        col_idx, remainder = divmod(col_idx - 1, 26)
        result = chr(65 + remainder) + result
    return result

if __name__ == "__main__":
    create_csv_and_xlsx()
