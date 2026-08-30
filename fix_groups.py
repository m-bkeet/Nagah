with open('src/features/academic/GroupsManagementView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I need to append the missing closing tags if they are missing
if not content.strip().endswith(');};'):
    content += "\n    </div>\n  );\n};\n"
    with open('src/features/academic/GroupsManagementView.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
