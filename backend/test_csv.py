#!/usr/bin/env python3
"""
Test CSV parsing
"""
import pandas as pd

# Read the CSV
df = pd.read_csv('../Hackgear2.0-final.csv')

print("CSV Columns:")
print(df.columns.tolist())
print("\nFirst few rows:")
print(df.head())
print("\nData types:")
print(df.dtypes)
print("\nMissing values:")
print(df.isnull().sum())
