import re

with open('src/core/constants/navigation.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the migration item
content = re.sub(r"\s*\{\s*id:\s*'migration'.*?\},", "", content, flags=re.DOTALL)

with open('src/core/constants/navigation.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed standalone migration tab from sidebar")
