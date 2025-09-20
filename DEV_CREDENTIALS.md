# 🔐 Development Test Credentials

## Quick Login Credentials
**All passwords:** `password123`

| Role | Email | Use Case |
|------|-------|----------|
| **Student** | `student@test.com` | Test partner matching features |
| **Instructor** | `instructor@test.com` | Test partner matching + instructor features |
| **Admin** | `admin@test.com` | Monitor partner matching in admin panel |

## Additional Test Users

| Name | Email | Role | Purpose |
|------|-------|------|---------|
| Sarah Johnson | `sarah.student@test.com` | Student | Additional student for matching tests |
| Mike Davis | `mike.instructor@test.com` | Instructor | Additional instructor for variety |
| Emily Wilson | `emily.student@test.com` | Student | More matching options |
| Carlos Rodriguez | `carlos.instructor@test.com` | Instructor | Instructor diversity |
| Jessica Martinez | `jessica.student@test.com` | Student | Complete test user pool |

## 🚀 Testing Partner Matching Integration

### For Students/Instructors:
1. Login with `student@test.com` or `instructor@test.com` (password: `password123`)
2. Navigate to: http://localhost:3000/dashboard/partner-matching
3. Create your partner profile
4. Test discovering other partners
5. Send match requests
6. Accept/reject incoming requests

### For Admins:
1. Login with `admin@test.com` (password: `password123`)
2. Navigate to: http://localhost:3000/admin
3. Click "Partner Matching" in sidebar
4. Explore 4 tabs:
   - **📊 Overview & Stats** - Metrics and analytics
   - **👥 User Profiles** - All partner profiles with filtering
   - **💌 Match Requests** - Monitor all requests
   - **💕 Active Matches** - View successful partnerships

### Access Control Test:
- **Students/Instructors**: ✅ Can access partner matching
- **Admins**: ❌ Cannot access partner matching (redirected with access denied message)
- **Admins**: ✅ Get full monitoring in admin panel

## 🔗 Key URLs
- **Login**: http://localhost:3000/login
- **Student Dashboard**: http://localhost:3000/dashboard
- **Instructor Dashboard**: http://localhost:3000/instructor/dashboard
- **Admin Panel**: http://localhost:3000/admin
- **Partner Matching**: http://localhost:3000/dashboard/partner-matching

## 🛡️ Role-Based Access Control
The system enforces proper role separation:
- Students & Instructors: Full partner matching access
- Admins: Monitoring access only (no partner matching features)
- All routes protected by middleware authentication

---
*All test accounts use the same password: `password123`*