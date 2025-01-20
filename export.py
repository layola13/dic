from readmdict import MDX
import sys
from tqdm import tqdm
import os

def export_mdx_words(mdx_path, output_path):
    try:
        # Check if MDX file exists
        if not os.path.exists(mdx_path):
            print(f"Error: MDX file not found at {mdx_path}")
            return

        # Load MDX file
        print(f"Loading MDX file: {mdx_path}")
        mdx = MDX(mdx_path)

        # Get all entries
        items = list(mdx.items())
        total_words = len(items)
        print(f"Found {total_words} entries")

        # Open file for writing with proper encoding
        with open(output_path, 'w', encoding='utf-8') as f:
            # Use tqdm for progress bar
            for key, _ in tqdm(items, desc="Exporting words"):
                try:
                    word = key.decode('utf-8').strip()
                    if word:  # Only write non-empty words
                        f.write(word + '\n')
                except UnicodeDecodeError as e:
                    print(f"Warning: Could not decode word: {e}")

        print(f"Export complete. Words saved to: {output_path}")

    except Exception as e:
        print(f"Error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    mdx_path = './ox9.mdx'
    output_path = './allwords.txt'
    export_mdx_words(mdx_path, output_path)