import pandas as pd

df = pd.read_csv("Cutoff_CSVs\dse_cap1_cutoffs_2025.csv")

print(df.info())
print(df["category"].unique())
print(df["course_name"].nunique())
print(df["college_name"].nunique())