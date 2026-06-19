import pdfplumber
import pandas as pd
import re

PDF_FILE = "Cutoff_PDFs/DSE_CAP1_CutOff_2024_25.pdf"

rows = []

with pdfplumber.open(PDF_FILE) as pdf:

    for page_num, page in enumerate(pdf.pages, start=1):

        text = page.extract_text()

        if not text:
            continue

        lines = [line.strip() for line in text.split("\n") if line.strip()]

        i = 0

        while i < len(lines):

            line = lines[i]

            # College line starts with 4 digit code
            if re.match(r"^\d{4}\s", line):

                college_name = line

                choice_code = None
                course_name = None

                # Parse Choice Code + Course Name
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

                    if choice_match:
                        choice_code = choice_match.group(1)

                    if course_match:
                        course_name = course_match.group(1).strip()

                # Need enough lines to continue
                if (
                    choice_code
                    and course_name
                    and i + 5 < len(lines)
                ):

                    categories = lines[i + 2].split()
                    ranks = lines[i + 3].split()

                    percentiles = re.findall(
                        r"\(([\d.]+)%\)",
                        lines[i + 5]
                    )

                    # Skip malformed blocks
                    if not (
                        len(categories)
                        == len(ranks)
                        == len(percentiles)
                    ):
                        i += 1
                        continue

                    for cat, rank, perc in zip(
                        categories,
                        ranks,
                        percentiles
                    ):

                        try:

                            rows.append(
                                {
                                    "college_name": college_name,
                                    "choice_code": int(choice_code),
                                    "course_name": course_name,
                                    "category": cat.strip(),
                                    "rank": rank.strip(),  # keep as TEXT
                                    "percentile": float(perc),
                                }
                            )

                        except Exception as e:

                            print(
                                f"[ERROR] Page {page_num}"
                            )
                            print(
                                f"College: {college_name}"
                            )
                            print(
                                f"Course: {course_name}"
                            )
                            print(
                                f"Category: {cat}"
                            )
                            print(
                                f"Rank: {rank}"
                            )
                            print(
                                f"Percentile: {perc}"
                            )
                            print(e)

            i += 1

df = pd.DataFrame(rows)

print("\n====================")
print("EXTRACTION COMPLETE")
print("====================")
print(f"Rows extracted: {len(df)}")
print()

print(df.head())

# Remove duplicates just in case
df = df.drop_duplicates()

print()
print(f"Rows after dedupe: {len(df)}")

OUTPUT_FILE = "Cutoff_CSVs/dse_cap1_cutoffs_2024.csv"

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print()
print(f"Saved -> {OUTPUT_FILE}")

print()
print("Unique Colleges:", df["college_name"].nunique())
print("Unique Branches:", df["course_name"].nunique())
print("Unique Categories:", df["category"].nunique())