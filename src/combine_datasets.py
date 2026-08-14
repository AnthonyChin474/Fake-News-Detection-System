
import pandas as pd

# ==========================================
# LOAD DATASETS
# ==========================================

print("Loading datasets...")

twitter_df = pd.read_csv(
    "datasets/processed/cleaned_twitter_train.csv"
)

fake_news_df = pd.read_csv(
    "datasets/processed/cleaned_fake_news.csv"
)

constraint_df = pd.read_excel(
    "datasets/raw/Constraint_English_Train.xlsx"
)

# ==========================================
# DISPLAY COLUMNS
# ==========================================

print("\nTwitter Columns:")
print(twitter_df.columns)

print("\nFake News Columns:")
print(fake_news_df.columns)

print("\nConstraint Columns:")
print(constraint_df.columns)

# ==========================================
# KEEP REQUIRED COLUMNS
# ==========================================

twitter_df = twitter_df[
    ['cleaned_text', 'label']
].copy()

fake_news_df = fake_news_df[
    ['cleaned_text', 'Label']
].copy()

fake_news_df.rename(
    columns={
        'Label': 'label'
    },
    inplace=True
)

constraint_df = constraint_df[
    ['tweet', 'label']
].copy()

constraint_df.rename(
    columns={
        'tweet': 'cleaned_text'
    },
    inplace=True
)

# ==========================================
# NORMALIZE LABELS
# ==========================================

twitter_df['label'] = twitter_df['label'].astype(int)

# Fake News dataset
fake_news_df['label'] = (
    fake_news_df['label']
    .astype(str)
    .str.lower()
)

fake_news_df['label'] = fake_news_df['label'].replace({
    'true': 0,
    'mostly-true': 0,

    'false': 1,
    'pants-fire': 1,

    # Optional:
    'half-true': 1,
    'barely-true': 1
})

fake_news_df = fake_news_df[
    fake_news_df['label'].isin([0, 1])
]

fake_news_df['label'] = (
    fake_news_df['label']
    .astype(int)
)

# Constraint dataset
constraint_df['label'] = (
    constraint_df['label']
    .astype(str)
    .str.lower()
)

constraint_df['label'] = constraint_df['label'].replace({
    'real': 0,
    'fake': 1
})

constraint_df = constraint_df[
    constraint_df['label'].isin([0, 1])
]

constraint_df['label'] = (
    constraint_df['label']
    .astype(int)
)

# ==========================================
# REMOVE NULLS
# ==========================================

twitter_df.dropna(inplace=True)
fake_news_df.dropna(inplace=True)
constraint_df.dropna(inplace=True)

# ==========================================
# REMOVE EMPTY TEXT
# ==========================================

twitter_df = twitter_df[
    twitter_df['cleaned_text']
    .astype(str)
    .str.strip() != ""
]

fake_news_df = fake_news_df[
    fake_news_df['cleaned_text']
    .astype(str)
    .str.strip() != ""
]

constraint_df = constraint_df[
    constraint_df['cleaned_text']
    .astype(str)
    .str.strip() != ""
]

# ==========================================
# DEBUG LABEL DISTRIBUTION
# ==========================================

print("\n==========================")
print("TWITTER LABELS")
print("==========================")
print(twitter_df['label'].value_counts())

print("\n==========================")
print("FAKE NEWS LABELS")
print("==========================")
print(fake_news_df['label'].value_counts())

print("\n==========================")
print("CONSTRAINT LABELS")
print("==========================")
print(constraint_df['label'].value_counts())

# ==========================================
# COMBINE DATASETS
# ==========================================

combined_df = pd.concat(
    [
        twitter_df,
        fake_news_df,
        constraint_df
    ],
    ignore_index=True
)

# ==========================================
# SHUFFLE
# ==========================================

combined_df = combined_df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)

# ==========================================
# SAVE
# ==========================================

combined_df.to_csv(
    "datasets/processed/combined_dataset.csv",
    index=False
)

# ==========================================
# FINAL REPORT
# ==========================================

print("\n==========================")
print("FINAL DATASET")
print("==========================")

print(combined_df.head())

print("\nShape:")
print(combined_df.shape)

print("\nLabel Distribution:")
print(combined_df['label'].value_counts())

print("\nUnique Labels:")
print(combined_df['label'].unique())

print("\nCombined dataset saved successfully!")

