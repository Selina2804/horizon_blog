#!/bin/bash
echo "🚀 Quick Fix TypeScript Errors..."

# 1. Fix Card.tsx - ReactNode import
sed -i "s/import { ReactNode }/import type { ReactNode }/" src/components/Card.tsx

# 2. Fix AuthContext.tsx - ReactNode import
sed -i "1s/^/import type { ReactNode } from 'react';\\n/" src/context/AuthContext.tsx

# 3. Tạo lib/utils.ts nếu chưa có
mkdir -p src/lib
cat > src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

# 4. Fix AdminPosts.tsx - undefined images
sed -i "s/post\.images\?\.length/post.images \&\& post.images.length/" src/Admin/Dashboard/AdminPosts.tsx
sed -i "s/src={\/post\.images\[0\]}/src={post.images \&\& post.images\[0\]}/" src/Admin/Dashboard/AdminPosts.tsx

# 5. Fix AdminUsers.tsx - parameter type
sed -i "s/users.map((u)/users.map((u: User)/" src/Admin/Dashboard/AdminUsers.tsx

# 6. Fix DashboardAdmin.tsx - parameter types
sed -i "s/posts.filter((p)/posts.filter((p: Post)/g" src/Admin/Dashboard/DashboardAdmin.tsx

# 7. Fix DashboardEdit.tsx - unused variable
sed -i "s/const { user } = useAuth()/const { user: currentUser } = useAuth()/" src/pages/Dashboard/DashboardEdit.tsx

# 8. Fix UserProfile.tsx - remove duplicate types
sed -i "/^type User = {/,/^};/d" src/pages/UserProfile/UserProfile.tsx
sed -i "/^type Post = {/,/^};/d" src/pages/UserProfile/UserProfile.tsx

# Thêm import nếu chưa có
if ! grep -q "import type.*User.*types" src/pages/UserProfile/UserProfile.tsx; then
  sed -i "1s/^/import type { User as AppUser, Post as AppPost } from '..\/..\/types\/index';\\n/" src/pages/UserProfile/UserProfile.tsx
fi

# 9. Fix handleSave trong UserProfile.tsx
sed -i "s/const updatedUser: User = {/const updatedUser: AppUser = {/" src/pages/UserProfile/UserProfile.tsx

echo "✅ Đã fix 9 lỗi TypeScript!"
echo "Chạy: npm run build để kiểm tra"