import pandas as pd

df = pd.read_csv("datasets/processed/cleaned_fake_news.csv")

print(df.head())
print(df.columns)