import re

with open('src/features/settings/SystemSettingsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# First, we need to add the import statement at the top.
import_statement = "import { BackupMigrationCenter } from './BackupMigrationCenter';\n"
if "BackupMigrationCenter" not in content:
    # Insert after standard imports
    content = re.sub(r"(import React.*?;\n)", r"\1" + import_statement, content, count=1)

# Now, we need to replace the BACKUP tab content.
# Look for {/* TAB 6: Backup & Sync */}
# Replace everything until the end of the file/div.

search_str = r"\{\/\* TAB 6: Backup & Sync \*\/\}.*?(?=\{\/\*|\<\/div\>\s*\<\/div\>\s*\)\;\s*\}\;)"
# It's better to just use a regular expression that targets the specific block.
# Since it's the last tab in the file, it ends before the closing of the main div and the component.

# Let's find the exact string of the tab start
# "      {/* TAB 6: Backup & Sync */}"

start_index = content.find("{/* TAB 6: Backup & Sync */}")
if start_index != -1:
    # Find the end of the BACKUP block.
    # It usually ends before the final `    </div>\n  );\n};`
    end_string = "    </div>\n  );\n};"
    end_index = content.rfind(end_string)
    
    if end_index != -1:
        new_tab_content = """      {/* TAB 6: Backup & Sync */}
      {activeTab === 'BACKUP' && (
        <BackupMigrationCenter />
      )}
"""
        content = content[:start_index] + new_tab_content + content[end_index:]
        
        with open('src/features/settings/SystemSettingsView.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Successfully replaced BACKUP tab")
    else:
        print("Could not find end of file signature")
else:
    print("Could not find TAB 6 marker")

