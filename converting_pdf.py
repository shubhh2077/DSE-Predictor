import pdfplumber
import pandas as pd
import re

PDF_FILE = "Cutoff_PDFs/DSE_CAP1_CutOff_2025_26.pdf"

rows = []

with pdfplumber.open(PDF_FILE) as pdf:

    for page in pdf.pages:

        text = page.extract_text()

        if not text:
            continue

        lines = [line.strip() for line in text.split("\n") if line.strip()]

        i = 0

        while i < len(lines):

            line = lines[i]

            # College name
            if re.match(r"^\d{4}\s", line):

                college_name = line

                # Next line should contain choice code and course name
                if i + 1 < len(lines):

                    info_line = lines[i + 1]

                    choice_match = re.search(
                        r"Choice Code\s*:\s*(\d+)",
                        info_line
                    )

                    course_match = re.search(
                        r"Course Name\s*:\s*(.*)",
                        info_line
                    )

                    if choice_match and course_match:

                        choice_code = choice_match.group(1)
                        course_name = course_match.group(1).strip()

                        # Categories
                        if i + 2 < len(lines):

                            categories = lines[i + 2].split()

                        # Ranks
                        if i + 3 < len(lines):

                            ranks = lines[i + 3].split()

                        # Percentiles
                        if i + 5 < len(lines):

                            percentiles = re.findall(
                                r"\(([\d.]+)%\)",
                                lines[i + 5]
                            )

                        if (
                            len(categories)
                            == len(ranks)
                            == len(percentiles)
                        ):

                            for cat, rank, perc in zip(
                                categories,
                                ranks,
                                percentiles
                            ):

                                rows.append(
                                    {
                                        "college_name": college_name,
                                        "choice_code": choice_code,
                                        "course_name": course_name,
                                        "category": cat,
                                        "rank": int(rank),
                                        "percentile": float(perc),
                                    }
                                )

            i += 1

df = pd.DataFrame(rows)

print(df.head())
print()
print("Rows extracted:", len(df))

df.to_csv(
    "dse_cap1_cutoffs_2025.csv",
    index=False
)

print("Saved -> dse_cap1_cutoffs_2025.csv")