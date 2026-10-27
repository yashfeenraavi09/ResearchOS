import numpy as np
import pandas as pd
from pathlib import Path

out_dir = Path(__file__).resolve().parent
np.random.seed(42)
n_v1 = 200

# V1: Clean Baseline
age = np.random.randint(30, 75, size=n_v1)
tp53 = np.round(np.random.normal(loc=4.5, scale=1.2, size=n_v1), 3)
brca1 = np.round(np.random.normal(loc=8.2, scale=1.8, size=n_v1), 3)
egfr = np.round(np.random.normal(loc=12.1, scale=2.5, size=n_v1), 3)
her2 = np.round(np.random.normal(loc=1.1, scale=0.3, size=n_v1), 3)
tumor_size = np.round(np.clip(np.random.normal(loc=2.8, scale=0.9, size=n_v1), 0.5, 6.0), 2)
stage = np.random.choice(['Stage I', 'Stage II', 'Stage III'], size=n_v1, p=[0.4, 0.4, 0.2])
prob_malignant = 1 / (1 + np.exp(-(0.05 * age + 0.3 * tp53 + 0.4 * tumor_size - 4.0)))
outcome = (np.random.rand(n_v1) < prob_malignant).astype(int)

df_v1 = pd.DataFrame({
    'patient_id': [f'PT-{1000 + i}' for i in range(n_v1)],
    'age': age,
    'gene_tp53': tp53,
    'gene_brca1': brca1,
    'gene_egfr': egfr,
    'protein_her2': her2,
    'tumor_size_cm': tumor_size,
    'stage': stage,
    'outcome': outcome
})
v1_path = out_dir / 'cancer_biomarkers_v1_baseline.csv'
df_v1.to_csv(v1_path, index=False)
print(f"Created: {v1_path.name} | Shape: {df_v1.shape} | Columns: {list(df_v1.columns)}")

# V2: Drifted Dataset (distribution shifts + new column)
n_v2 = 260
age_v2 = np.random.randint(45, 85, size=n_v2)
tp53_v2 = np.round(np.random.normal(loc=6.8, scale=1.6, size=n_v2), 3)
brca1_v2 = np.round(np.random.normal(loc=8.5, scale=2.0, size=n_v2), 3)
egfr_v2 = np.round(np.random.normal(loc=14.3, scale=3.1, size=n_v2), 3)
her2_v2 = np.round(np.random.normal(loc=1.4, scale=0.4, size=n_v2), 3)
tumor_size_v2 = np.round(np.clip(np.random.normal(loc=3.6, scale=1.1, size=n_v2), 0.8, 7.5), 2)
stage_v2 = np.random.choice(['Stage I', 'Stage II', 'Stage III', 'Stage IV'], size=n_v2, p=[0.2, 0.35, 0.3, 0.15])
prob_mal_v2 = 1 / (1 + np.exp(-(0.06 * age_v2 + 0.35 * tp53_v2 + 0.45 * tumor_size_v2 - 4.5)))
outcome_v2 = (np.random.rand(n_v2) < prob_mal_v2).astype(int)
treatment_cohort = np.random.choice(['Standard Chemo', 'Targeted Inhibitor', 'Combination'], size=n_v2)

df_v2 = pd.DataFrame({
    'patient_id': [f'PT-{2000 + i}' for i in range(n_v2)],
    'age': age_v2,
    'gene_tp53': tp53_v2,
    'gene_brca1': brca1_v2,
    'gene_egfr': egfr_v2,
    'protein_her2': her2_v2,
    'tumor_size_cm': tumor_size_v2,
    'stage': stage_v2,
    'treatment_cohort': treatment_cohort,
    'outcome': outcome_v2
})
v2_path = out_dir / 'cancer_biomarkers_v2_drifted.csv'
df_v2.to_csv(v2_path, index=False)
print(f"Created: {v2_path.name} | Shape: {df_v2.shape} | Columns: {list(df_v2.columns)}")

# V3: Dirty Dataset (missing values, duplicates, to test data quality engine)
df_v3 = df_v1.copy()
duplicates = df_v3.iloc[:15].copy()
df_v3 = pd.concat([df_v3, duplicates], ignore_index=True)
mask_missing = np.random.rand(*df_v3[['gene_tp53', 'protein_her2', 'tumor_size_cm']].shape) < 0.15
df_v3.loc[:, ['gene_tp53', 'protein_her2', 'tumor_size_cm']] = df_v3[['gene_tp53', 'protein_her2', 'tumor_size_cm']].mask(mask_missing)
v3_path = out_dir / 'cancer_biomarkers_v3_dirty.csv'
df_v3.to_csv(v3_path, index=False)
print(f"Created: {v3_path.name} | Shape: {df_v3.shape} | Missing: ~15% on 3 cols, 15 duplicates")
