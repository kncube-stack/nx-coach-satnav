#!/usr/bin/env python3
"""Extract stop rows from NX_Stops.xlsx into stops.json without external deps."""

import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def normalize_postcode(postcode: str) -> str:
    cleaned = re.sub(r"\s+", "", postcode.upper())
    if len(cleaned) <= 3:
        return cleaned
    return f"{cleaned[:-3]} {cleaned[-3:]}"


def read_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    path = "xl/sharedStrings.xml"
    if path not in archive.namelist():
        return []

    root = ET.fromstring(archive.read(path))
    strings = []
    for item in root:
        text = "".join(node.text or "" for node in item.iter(f"{{{NS['a']}}}t"))
        strings.append(text)
    return strings


def load_rows(xlsx_path: Path) -> list[dict[str, str]]:
    with zipfile.ZipFile(xlsx_path) as archive:
        shared_strings = read_shared_strings(archive)
        sheet_xml = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        rows = sheet_xml.findall(".//a:sheetData/a:row", NS)

    data = []
    for row in rows[1:]:
        cells = row.findall("a:c", NS)
        values: list[str] = []
        for cell in cells:
            cell_type = cell.attrib.get("t")
            value_node = cell.find("a:v", NS)
            value = "" if value_node is None or value_node.text is None else value_node.text.strip()
            if cell_type == "s" and value:
                value = shared_strings[int(value)]
            values.append(value.strip())

        if len(values) < 2:
            continue

        stop_name, postcode = values[0], values[1]
        if not stop_name or not postcode:
            continue

        data.append(
            {
                "id": len(data) + 1,
                "name": stop_name,
                "postcode": normalize_postcode(postcode),
            }
        )

    return data


def main() -> None:
    project_dir = Path(__file__).resolve().parent.parent
    xlsx_path = project_dir / "NX_Stops.xlsx"
    out_path = project_dir / "stops.json"

    stops = load_rows(xlsx_path)
    out_path.write_text(json.dumps(stops, indent=2), encoding="utf-8")
    print(f"Wrote {len(stops)} stops to {out_path}")


if __name__ == "__main__":
    main()
