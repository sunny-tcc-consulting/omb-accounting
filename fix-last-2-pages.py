#!/usr/bin/env python3
"""Fix the last 2 i18n pages"""

# Fix Users page
users_file = "/home/tcc/.openclaw/workspace/omb-accounting/src/app/(dashboard)/users/page.tsx"
with open(users_file, 'r') as f:
    users_content = f.read()

# Add Chinese text
users_content = users_content.replace(
    't("users.userManagement")}</p>',
    't("users.userManagement")} <span className="text-indigo-600">用戶管理</span></p>'
)

with open(users_file, 'w') as f:
    f.write(users_content)
print("Users page fixed")

# Fix Dashboard page
dashboard_file = "/home/tcc/.openclaw/workspace/omb-accounting/src/app/(dashboard)/dashboard/page.tsx"
with open(dashboard_file, 'r') as f:
    content = f.read()

# Find and replace header
old = '{t("dashboard.title")}</h1>'
new = '{t("dashboard.title")} <span className="text-indigo-600">財務</span> <span className="text-gray-400">Overview</span></h1>'
content = content.replace(old, new)

with open(dashboard_file, 'w') as f:
    f.write(content)
print("Dashboard page fixed")

print("\nAll i18n fixes applied!")