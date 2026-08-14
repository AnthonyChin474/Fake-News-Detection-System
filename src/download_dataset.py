from datasets import load_dataset
import pandas as pd

# Load dataset from Hugging Face
ds = load_dataset("roupenminassian/twitter-misinformation")

# Convert train split to pandas dataframe
train_df = ds['train'].to_pandas()

# Convert test split to pandas dataframe
test_df = ds['test'].to_pandas()

# Save as CSV
train_df.to_csv("datasets/raw/twitter_train.csv", index=False)
test_df.to_csv("datasets/raw/twitter_test.csv", index=False)

print("Dataset downloaded and saved successfully!")