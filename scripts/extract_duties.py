#!/usr/bin/env python3
"""Extract duty cards from New Duty Cards.pdf into duties.json.

No external dependencies are required.
"""

from __future__ import annotations

import json
import re
import zlib
from pathlib import Path
from typing import Dict, List, Optional, Tuple

TIME_RE = re.compile(r"^\d{2}:\d{2}$")
DATE_RE = re.compile(r"^\d{1,2}-[A-Za-z]{3}-\d{2}$")

ROUTE_RULES: Dict[str, Dict[str, object]] = {
    "A6": {"origin": 2, "destination": 8, "include_return": True},
    "400": {"origin": 1, "destination": 11, "include_return": False},
    "450": {"origin": 1, "destination": 13, "include_return": False},
    "025": {"origin": 1, "destination": 23, "include_return": False},
    "25": {"origin": 1, "destination": 23, "include_return": False},
    "440": {"origin": 1, "destination": 17, "include_return": False},
}


def normalize_text(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", " ", value.lower())
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def parse_pdf_literal(value: str) -> str:
    out: List[str] = []
    i = 0
    while i < len(value):
        char = value[i]
        if char != "\\":
            out.append(char)
            i += 1
            continue

        i += 1
        if i >= len(value):
            break

        escaped = value[i]
        i += 1

        simple = {
            "n": "\n",
            "r": "\r",
            "t": "\t",
            "b": "\b",
            "f": "\f",
            "(": "(",
            ")": ")",
            "\\": "\\",
        }
        if escaped in simple:
            out.append(simple[escaped])
            continue

        if escaped in "01234567":
            octal = escaped
            for _ in range(2):
                if i < len(value) and value[i] in "01234567":
                    octal += value[i]
                    i += 1
                else:
                    break
            out.append(chr(int(octal, 8)))
            continue

        out.append(escaped)

    return "".join(out)


def load_tt4_cmap(pdf_bytes: bytes) -> Dict[int, str]:
    font_obj_match = re.search(
        rb"(\d+)\s+0\s+obj\s*<<[^>]*?/BaseFont\s*/AAAAAE\+Calibri-Bold[^>]*?/ToUnicode\s+(\d+)\s+0\s+R[^>]*?>>",
        pdf_bytes,
        re.S,
    )
    if not font_obj_match:
        raise RuntimeError("Unable to find TT4 font ToUnicode mapping in PDF")

    to_unicode_obj = int(font_obj_match.group(2).decode("ascii"))
    obj_match = re.search(rb"%d\s+0\s+obj(.*?)endobj" % to_unicode_obj, pdf_bytes, re.S)
    if not obj_match:
        raise RuntimeError(f"Unable to read ToUnicode object {to_unicode_obj}")

    obj = obj_match.group(1)
    stream_start = re.search(rb"stream\r?\n", obj)
    stream_end = re.search(rb"endstream", obj)
    if not stream_start or not stream_end:
        raise RuntimeError("Malformed ToUnicode stream")

    data = obj[stream_start.end() : stream_end.start()]
    if data.endswith(b"\r\n"):
        data = data[:-2]
    elif data.endswith(b"\n"):
        data = data[:-1]

    cmap_text = zlib.decompress(data).decode("latin1", errors="ignore")

    cmap: Dict[int, str] = {}
    for start_hex, end_hex, uni_hex in re.findall(
        r"<([0-9A-Fa-f]{2})><([0-9A-Fa-f]{2})><([0-9A-Fa-f]{4})>", cmap_text
    ):
        start = int(start_hex, 16)
        end = int(end_hex, 16)
        uni = int(uni_hex, 16)
        for code in range(start, end + 1):
            cmap[code] = chr(uni + (code - start))

    return cmap


def decode_text(raw: str, font_name: str, tt4_cmap: Dict[int, str]) -> str:
    text = parse_pdf_literal(raw)
    if font_name == "TT4":
        return "".join(tt4_cmap.get(ord(ch), ch) for ch in text)
    return text


def extract_streams(pdf_bytes: bytes) -> List[str]:
    streams: List[str] = []
    for match in re.finditer(rb"stream\r?\n", pdf_bytes):
        start = match.end()
        end = pdf_bytes.find(b"endstream", start)
        if end == -1:
            continue

        data = pdf_bytes[start:end]
        if data.endswith(b"\r\n"):
            data = data[:-2]
        elif data.endswith(b"\n"):
            data = data[:-1]

        try:
            decoded = zlib.decompress(data)
        except Exception:
            continue

        if b"(Duty)" in decoded:
            streams.append(decoded.decode("latin1", errors="ignore"))

    return streams


def extract_tokens(content_stream: str, tt4_cmap: Dict[int, str]) -> List[Dict[str, object]]:
    tokens: List[Dict[str, object]] = []

    for block in re.findall(r"BT(.*?)ET", content_stream, re.S):
        font_match = re.search(r"/([A-Za-z0-9]+)\s+[0-9.]+\s+Tf", block)
        font = font_match.group(1) if font_match else ""

        tm_match = re.search(
            r"[-0-9.]+\s+[-0-9.]+\s+[-0-9.]+\s+[-0-9.]+\s+([-0-9.]+)\s+([-0-9.]+)\s+Tm",
            block,
        )
        if not tm_match:
            continue

        x = float(tm_match.group(1))
        y = float(tm_match.group(2))

        parts: List[str] = []

        for literal in re.findall(r"\((?:\\.|[^\\)])*\)\s*Tj", block):
            raw = re.match(r"\((.*)\)\s*Tj", literal, re.S)
            if not raw:
                continue
            text = decode_text(raw.group(1), font, tt4_cmap).strip()
            if text:
                parts.append(text)

        for arr in re.findall(r"\[(.*?)\]\s*TJ", block, re.S):
            literals = re.findall(r"\((?:\\.|[^\\)])*\)", arr)
            if not literals:
                continue
            combined = "".join(
                decode_text(re.match(r"\((.*)\)", lit, re.S).group(1), font, tt4_cmap)
                for lit in literals
            ).strip()
            if combined:
                parts.append(combined)

        if parts:
            tokens.append(
                {
                    "x": x,
                    "y": y,
                    "side": "left" if x < 330 else "right",
                    "text": " ".join(parts),
                }
            )

    tokens.sort(key=lambda item: (-item["y"], item["x"]))
    return tokens


def extract_duty_id(tokens: List[Dict[str, object]]) -> Optional[str]:
    for token in tokens:
        text = str(token["text"])
        y = float(token["y"])
        if y > 740 and re.fullmatch(r"\d{3}", text):
            return text
    return None


def extract_route_codes(tokens: List[Dict[str, object]]) -> List[str]:
    routes: List[str] = []
    for token in tokens:
        if str(token["text"]) != "Route":
            continue

        y = float(token["y"])
        x = float(token["x"])
        for candidate in tokens:
            if abs(float(candidate["y"]) - y) < 0.9 and float(candidate["x"]) > x:
                value = str(candidate["text"])
                if re.fullmatch(r"[A-Za-z0-9]{1,4}", value):
                    routes.append(value)
                    break

    deduped: List[str] = []
    seen = set()
    for route in routes:
        if route in seen:
            continue
        seen.add(route)
        deduped.append(route)
    return deduped


def parse_time_to_minutes(value: str) -> int:
    hour, minute = value.split(":")
    return int(hour) * 60 + int(minute)


def extract_timeline(tokens: List[Dict[str, object]]) -> List[Dict[str, object]]:
    non_time_tokens = [
        token
        for token in tokens
        if not TIME_RE.fullmatch(str(token["text"]))
        and not DATE_RE.fullmatch(str(token["text"]))
        and str(token["text"]) not in {"Duty", "Route"}
        and not re.fullmatch(r"\d{3}", str(token["text"]))
    ]

    timeline: List[Dict[str, object]] = []

    for token in tokens:
        time_text = str(token["text"])
        if not TIME_RE.fullmatch(time_text):
            continue

        y = float(token["y"])
        side = str(token["side"])

        near = [
            item
            for item in non_time_tokens
            if str(item["side"]) == side and abs(float(item["y"]) - y) <= 1.2
        ]

        if not near:
            near = [
                item
                for item in non_time_tokens
                if str(item["side"]) == side and 0 < (y - float(item["y"])) <= 2.0
            ]
            near.sort(key=lambda item: (y - float(item["y"]), float(item["x"])))
            near = near[:3]

        near.sort(key=lambda item: (-float(item["y"]), float(item["x"])))

        description_parts: List[str] = []
        for item in near:
            text = str(item["text"]).strip()
            if not text:
                continue
            if TIME_RE.search(text):
                continue
            if text in {"Monday to Friday", "Saturday", "Sunday"}:
                continue
            description_parts.append(text)

        description = " ".join(description_parts).strip()
        if not description:
            description = "Timed event"

        timeline.append(
            {
                "time": time_text,
                "description": description,
                "side": side,
                "y": y,
            }
        )

    timeline.sort(key=lambda item: float(item["y"]), reverse=True)

    for entry in timeline:
        minutes = parse_time_to_minutes(str(entry["time"]))
        entry["sortKey"] = minutes

    timeline.sort(key=lambda item: (int(item["sortKey"]), float(item["y"]) * -1))

    for entry in timeline:
        entry.pop("y", None)
        entry.pop("side", None)
        entry.pop("sortKey", None)

    return timeline


def build_stop_aliases() -> List[Tuple[re.Pattern[str], int]]:
    return [
        (re.compile(r"\blondon victoria\b|\bvictoria\b"), 1),
        (re.compile(r"\bpaddington\b"), 2),
        (re.compile(r"\bbaker street\b"), 3),
        (re.compile(r"\bst john\s*s wood\b|\bst johns wood\b"), 4),
        (re.compile(r"\bgolders? green\b"), 7),
        (re.compile(r"\bfinchley road and frognal\b|\bfrognal\b"), 6),
        (re.compile(r"\bfinchley road\b"), 5),
        (re.compile(r"\bstansted\b"), 8),
        (re.compile(r"\bnorth acton\b"), 9),
        (re.compile(r"\bgreenford\b"), 10),
        (re.compile(r"\bbirmingham\b"), 11),
        (re.compile(r"\bnottingham university\b|\buniversity of nottingham\b"), 12),
        (re.compile(r"\bbroad marsh\b"), 13),
        (re.compile(r"\bmilton keynes\b"), 14),
        (re.compile(r"\bmarble arch\b"), 15),
        (re.compile(r"\bcoventry\b|\bpool meadow\b"), 16),
        (re.compile(r"\bleicester\b|\bst margaret\b"), 17),
        (re.compile(r"\bheathrow\b.*\bt2\b|\bheathrow\b.*\bt3\b"), 18),
        (re.compile(r"\bheathrow\b.*\bt5\b"), 19),
        (re.compile(r"\bheathrow\b.*\bt4\b"), 20),
        (re.compile(r"\bgatwick\b.*\bsouth\b"), 21),
        (re.compile(r"\bgatwick\b.*\bnorth\b"), 22),
        (re.compile(r"\bbrighton\b.*\byork place\b"), 28),
        (re.compile(r"\bbrighton\b.*\bpreston circus\b"), 27),
        (re.compile(r"\bbrighton\b.*\bpreston park\b"), 26),
        (re.compile(r"\bbrighton\b.*\bwithdean\b"), 25),
        (re.compile(r"\bbrighton\b.*\bpatcham\b"), 24),
        (re.compile(r"\bbrighton\b"), 23),
    ]


def attach_stop_matches(timeline: List[Dict[str, object]], aliases: List[Tuple[re.Pattern[str], int]]) -> Tuple[List[int], List[str]]:
    stop_ids: List[int] = []
    unmatched: List[str] = []

    for event in timeline:
        description = str(event["description"])
        normalized = normalize_text(description)

        matched_id: Optional[int] = None
        for pattern, stop_id in aliases:
            if pattern.search(normalized):
                matched_id = stop_id
                break

        if matched_id is not None:
            event["stopId"] = matched_id
            if not stop_ids or stop_ids[-1] != matched_id:
                stop_ids.append(matched_id)
        elif "stand" not in normalized and "sign" not in normalized and "break" not in normalized:
            if description not in unmatched:
                unmatched.append(description)

    return stop_ids, unmatched


def collapse_consecutive_duplicates(ids: List[int]) -> List[int]:
    collapsed: List[int] = []
    for stop_id in ids:
        if collapsed and collapsed[-1] == stop_id:
            continue
        collapsed.append(stop_id)
    return collapsed


def pick_primary_route_code(route_codes: List[str]) -> Optional[str]:
    for route_code in route_codes:
        normalized = str(route_code).strip().upper()
        if normalized in ROUTE_RULES:
            return normalized
    return None


def slice_first_leg(sequence: List[int], start: int, end: int) -> Optional[Tuple[int, int]]:
    try:
        start_index = sequence.index(start)
    except ValueError:
        return None

    for index in range(start_index + 1, len(sequence)):
        if sequence[index] == end:
            return start_index, index

    return None


def simplify_stop_ids(stop_ids: List[int], route_codes: List[str]) -> List[int]:
    sequence = collapse_consecutive_duplicates(stop_ids)
    if len(sequence) < 2:
        return sequence

    route_code = pick_primary_route_code(route_codes)
    if not route_code:
        return sequence

    rule = ROUTE_RULES[route_code]
    origin = int(rule["origin"])
    destination = int(rule["destination"])
    include_return = bool(rule["include_return"])

    leg = slice_first_leg(sequence, origin, destination)
    direction = "outbound"

    if leg is None:
        leg = slice_first_leg(sequence, destination, origin)
        direction = "inbound"

    if leg is None:
        return sequence

    start_index, end_index = leg
    primary_segment = sequence[start_index : end_index + 1]

    if not include_return:
        return primary_segment

    if direction == "outbound":
        return_start = destination
        return_end = origin
    else:
        return_start = origin
        return_end = destination

    follow_on = sequence[end_index:]
    return_leg = slice_first_leg(follow_on, return_start, return_end)
    if return_leg is None:
        return primary_segment

    ret_start, ret_end = return_leg
    return_segment = follow_on[ret_start : ret_end + 1]
    if len(return_segment) <= 1:
        return primary_segment

    return primary_segment + return_segment[1:]


def build_display_timeline(
    timeline: List[Dict[str, object]],
    planned_stop_ids: List[int],
) -> List[Dict[str, object]]:
    if not timeline or not planned_stop_ids:
        return timeline

    selected_indexes: List[int] = []
    cursor = 0

    for stop_id in planned_stop_ids:
        found_index: Optional[int] = None
        for index in range(cursor, len(timeline)):
            event_stop_id = timeline[index].get("stopId")
            if event_stop_id == stop_id:
                found_index = index
                break
        if found_index is None:
            continue
        selected_indexes.append(found_index)
        cursor = found_index + 1

    if not selected_indexes:
        return timeline

    min_index = min(selected_indexes)
    max_index = max(selected_indexes)
    selected_index_set = set(selected_indexes)

    def is_key_non_stop_event(event: Dict[str, object]) -> bool:
        if "stopId" in event:
            return False
        text = normalize_text(str(event.get("description", "")))
        return (
            "break" in text
            or "pull on stand" in text
            or "sign on" in text
            or "sign off" in text
        )

    filtered: List[Dict[str, object]] = []
    for index in range(min_index, max_index + 1):
        event = timeline[index]
        if index in selected_index_set or is_key_non_stop_event(event):
            filtered.append(event)

    return filtered


def main() -> None:
    project_dir = Path(__file__).resolve().parent.parent
    pdf_path = project_dir / "New Duty Cards.pdf"
    output_path = project_dir / "duties.json"

    if not pdf_path.exists():
        raise FileNotFoundError(f"Duty PDF not found: {pdf_path}")

    pdf_bytes = pdf_path.read_bytes()
    tt4_cmap = load_tt4_cmap(pdf_bytes)
    streams = extract_streams(pdf_bytes)

    aliases = build_stop_aliases()

    duties_by_id: Dict[str, Dict[str, object]] = {}

    for stream in streams:
        tokens = extract_tokens(stream, tt4_cmap)
        duty_id = extract_duty_id(tokens)
        if not duty_id:
            continue

        if duty_id in duties_by_id:
            continue

        route_codes = extract_route_codes(tokens)
        timeline = extract_timeline(tokens)
        stop_ids, unmatched = attach_stop_matches(timeline, aliases)
        simplified_stop_ids = simplify_stop_ids(stop_ids, route_codes)
        display_timeline = build_display_timeline(timeline, simplified_stop_ids)

        duties_by_id[duty_id] = {
            "dutyId": duty_id,
            "label": f"Duty {duty_id}" + (f" (Route {'/'.join(route_codes)})" if route_codes else ""),
            "routeCodes": route_codes,
            "stopIds": simplified_stop_ids,
            "timeline": display_timeline,
            "unmatchedEvents": unmatched,
        }

    duties = sorted(duties_by_id.values(), key=lambda item: int(str(item["dutyId"])))
    output_path.write_text(json.dumps(duties, indent=2), encoding="utf-8")
    print(f"Wrote {len(duties)} duties to {output_path}")


if __name__ == "__main__":
    main()
