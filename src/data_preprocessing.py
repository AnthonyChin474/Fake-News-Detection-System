import pandas as pd
import re
import os

# =========================
# CLEANING FUNCTION
# =========================

def clean_text(text):
    text = str(text).lower()

    # Remove URLs
    text = re.sub(r"http\S+", "", text)

    # Remove mentions
    text = re.sub(r"@\w+", "", text)

    # Remove hashtags
    text = re.sub(r"#\w+", "", text)

    # Remove punctuation and numbers
    text = re.sub(r"[^a-zA-Z\s]", "", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()

    return text


# =========================
# CREATE OUTPUT FOLDER
# =========================

os.makedirs("datasets/processed", exist_ok=True)

# =========================
# LOAD DATASETS
# =========================

print("Loading datasets...")

fake_news_df = pd.read_csv(
    "datasets/raw/fake_news.csv",
    encoding="latin1"
)

twitter_train_df = pd.read_csv(
    "datasets/raw/twitter_train.csv",
    encoding="latin1"
)

print("\nFake News Columns:")
print(fake_news_df.columns)

print("\nTwitter Train Columns:")
print(twitter_train_df.columns)

# =========================
# REMOVE DUPLICATES
# =========================

fake_news_df.drop_duplicates(inplace=True)
twitter_train_df.drop_duplicates(inplace=True)

# =========================
# REMOVE NULL VALUES
# =========================

fake_news_df.dropna(inplace=True)
twitter_train_df.dropna(inplace=True)

# =========================
# DETECT TEXT COLUMN
# =========================

# Fake News Dataset
if "News_Headline" in fake_news_df.columns:
    fake_news_df["cleaned_text"] = fake_news_df["News_Headline"].apply(clean_text)

elif "text" in fake_news_df.columns:
    fake_news_df["cleaned_text"] = fake_news_df["text"].apply(clean_text)

elif "title" in fake_news_df.columns:
    fake_news_df["cleaned_text"] = fake_news_df["title"].apply(clean_text)

else:
    raise Exception(
        "Could not find text column in fake_news.csv"
    )

# Twitter Dataset
if "text" in twitter_train_df.columns:
    twitter_train_df["cleaned_text"] = twitter_train_df["text"].apply(clean_text)

elif "tweet" in twitter_train_df.columns:
    twitter_train_df["cleaned_text"] = twitter_train_df["tweet"].apply(clean_text)

else:
    raise Exception(
        "Could not find text column in twitter_train.csv"
    )

# =========================
# SAVE CLEANED DATASETS
# =========================

fake_news_df.to_csv(
    "datasets/processed/cleaned_fake_news.csv",
    index=False
)

twitter_train_df.to_csv(
    "datasets/processed/cleaned_twitter_train.csv",
    index=False
)

print("\nDatasets cleaned successfully!")

print(
    f"Fake News Records: {len(fake_news_df)}"
)

print(
    f"Twitter Records: {len(twitter_train_df)}"
)

print(
    "\nFiles saved to datasets/processed/"
)