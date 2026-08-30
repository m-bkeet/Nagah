with open('src/features/settings/BackupMigrationCenter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { celebrate } from '../../utils/celebration';", "import { useToast } from '../../core/notifications/ToastContext';")
content = content.replace("export const BackupMigrationCenter: React.FC = () => {", "export const BackupMigrationCenter: React.FC = () => {\n  const { celebrate } = useToast();")

with open('src/features/settings/BackupMigrationCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched useToast in BackupMigrationCenter")
