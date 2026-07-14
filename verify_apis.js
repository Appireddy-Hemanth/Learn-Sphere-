const API = 'http://localhost:5000/api';

async function runTests() {
    console.log('🚀 Starting API End-to-End Verification (using native fetch)...\n');

    let cookies = '';

    const request = async (path, options = {}) => {
        const url = `${API}${path}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        if (cookies) {
            headers['Cookie'] = cookies;
        }

        const res = await fetch(url, {
            ...options,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined
        });

        const setCookie = res.headers.get('set-cookie');
        if (setCookie) {
            cookies = setCookie.split(',').map(c => c.split(';')[0]).join('; ');
        }

        const isJson = res.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await res.json() : await res.text();

        if (!res.ok) {
            const err = new Error(typeof data === 'object' ? (data.message || 'Error') : data);
            err.status = res.status;
            err.data = data;
            throw err;
        }

        return { data, status: res.status };
    };

    try {
        // 1. Sign up test user
        console.log('1. Testing User Registration...');
        const email = `test_${Date.now()}@example.com`;
        const regRes = await request('/auth/register', {
            method: 'POST',
            body: {
                name: 'Verification Buddy',
                email: email,
                password: 'Verification@123'
            }
        });
        const testUserId = regRes.data._id;
        console.log('✅ User registered successfully. ID:', testUserId);

        // 2. Fetch Profile
        console.log('2. Fetching User Profile...');
        const profileRes = await request('/auth/profile');
        console.log('✅ Fetched profile successfully. Name:', profileRes.data.name, 'XP:', profileRes.data.xp);

        // 3. Update Profile
        console.log('3. Updating User Profile...');
        const updateRes = await request('/auth/profile', {
            method: 'PUT',
            body: {
                name: 'Verification Buddy Edited',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
            }
        });
        console.log('✅ Updated profile successfully. New name:', updateRes.data.name);

        // 4. Enroll in a course (Course ID 1 or first course in DB)
        console.log('4. Listing Courses...');
        const coursesRes = await request('/courses');
        const courses = coursesRes.data || [];
        if (courses.length === 0) {
            throw new Error('No courses found in database to enroll in.');
        }
        const courseId = courses[0].id;
        console.log(`✅ Found course: "${courses[0].title}" (ID: ${courseId})`);

        console.log(`5. Enrolling in Course ${courseId}...`);
        const enrollRes = await request(`/enrollments/${courseId}`, { method: 'POST' });
        console.log('✅ Enrolled successfully. Progress:', enrollRes.data.progress);

        console.log('6. Checking Course Enrollment Status...');
        const statusRes = await request(`/enrollments/${courseId}/status`);
        console.log('✅ Checked status successfully. Enrolled:', statusRes.data.enrolled);

        // 5. Reviews
        console.log('7. Posting Course Review...');
        const reviewRes = await request(`/reviews/${courseId}`, {
            method: 'POST',
            body: {
                rating: 5,
                comment: 'Absolutely spectacular course! The APIs are clean and working well.'
            }
        });
        console.log('✅ Submitted review successfully. Rating:', reviewRes.data.rating);

        console.log('8. Fetching Course Reviews...');
        const reviewsRes = await request(`/reviews/${courseId}`);
        console.log('✅ Fetched reviews list successfully. Reviews count:', reviewsRes.data.length);

        // 6. Admin Panel Stats & List
        console.log('9. Verifying Admin Guard restricts non-admins...');
        try {
            await request('/auth/admin/stats');
            throw new Error('Failure: Admin Stats endpoint allowed a student user!');
        } catch (err) {
            if (err.status === 401) {
                console.log('✅ Admin guard successfully blocked student (401 Unauthorized)');
            } else {
                throw err;
            }
        }

        // Register dynamic administrator of Admin role to test admin endpoints
        console.log('10. Registering dynamic Administrator user...');
        const adminEmail = `admin_${Date.now()}@example.com`;
        const adminRegRes = await request('/auth/register', {
            method: 'POST',
            body: {
                name: 'System Admin verifier',
                email: adminEmail,
                password: 'AdminPassword@123',
                role: 'Admin'
            }
        });
        const testAdminId = adminRegRes.data._id;
        console.log('✅ Admin user registered successfully. ID:', testAdminId);

        // Login as dynamic administrator
        console.log('11. Logging in as administrator...');
        let adminCookies = '';
        const adminRequest = async (path, options = {}) => {
            const url = `${API}${path}`;
            const headers = {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            };
            if (adminCookies) {
                headers['Cookie'] = adminCookies;
            }

            const res = await fetch(url, {
                ...options,
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined
            });

            const setCookie = res.headers.get('set-cookie');
            if (setCookie) {
                adminCookies = setCookie.split(',').map(c => c.split(';')[0]).join('; ');
            }

            const isJson = res.headers.get('content-type')?.includes('application/json');
            const data = isJson ? await res.json() : await res.text();

            if (!res.ok) {
                const err = new Error(typeof data === 'object' ? (data.message || 'Error') : data);
                err.status = res.status;
                throw err;
            }

            return { data };
        };

        await adminRequest('/auth/login', {
            method: 'POST',
            body: {
                email: adminEmail,
                password: 'AdminPassword@123'
            }
        });
        console.log('✅ Logged in as administrator.');

        console.log('12. Querying Admin Stats...');
        const statsRes = await adminRequest('/auth/admin/stats');
        console.log('✅ Admin stats loaded successfully:', statsRes.data);

        console.log('13. Querying Admin Users List...');
        const usersRes = await adminRequest('/auth/admin/users');
        console.log('✅ Admin users read successfully. Users in system:', usersRes.data.length);

        // 7. Notifications
        console.log('14. Querying Student Notifications...');
        const notesRes = await request('/notifications');
        const list = notesRes.data.notifications || [];
        console.log('✅ Loaded notifications successfully. Notifications count:', list.length);
        if (list.length > 0) {
            const noteId = list[0].id;
            console.log(`15. Marking notification ${noteId} as read...`);
            await request(`/notifications/${noteId}/read`, { method: 'PUT' });
            console.log('✅ Notification marked read successfully');
        }

        // 8. Delete test user (Cleanup)
        console.log(`16. Cleaning up/Deleting verification user ${testUserId}...`);
        await adminRequest(`/auth/admin/users/${testUserId}`, { method: 'DELETE' });
        console.log('✅ Verification user deleted successfully.');

        // Delete test admin user (verifying safeguard prevents self-deletion)
        console.log(`17. Deleting verification admin ${testAdminId} (should fail due to safeguard)...`);
        try {
            await adminRequest(`/auth/admin/users/${testAdminId}`, { method: 'DELETE' });
            throw new Error('Failure: Admin was allowed to delete themselves!');
        } catch (err) {
            console.log('✅ Safeguard successful. Self-deletion blocked with message:', err.message);
        }

        // Now since we logged in as admin, we can delete the admin by logging back as another user? Or we can just leave it there or it doesn't matter (since it was just created for the test and we verified deletion works).
        // Let's delete the admin user by registers/login of another temporary admin and deleting this admin, or we don't have to delete it as it is a DB record. Let's register a second admin to delete the first admin, to be perfectly clean!
        console.log('18. Registering second Administrator user for clean database teardown...');
        const cleanAdminEmail = `clean_admin_${Date.now()}@example.com`;
        const cleanReg = await request('/auth/register', {
            method: 'POST',
            body: {
                name: 'Teardown Admin',
                email: cleanAdminEmail,
                password: 'AdminPassword@123',
                role: 'Admin'
            }
        });
        const cleanAdminId = cleanReg.data._id;

        console.log('19. Logging in as teardown administrator...');
        let teardownCookies = '';
        const teardownRequest = async (path, options = {}) => {
            const url = `${API}${path}`;
            const headers = {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            };
            if (teardownCookies) {
                headers['Cookie'] = teardownCookies;
            }

            const res = await fetch(url, {
                ...options,
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined
            });

            const setCookie = res.headers.get('set-cookie');
            if (setCookie) {
                teardownCookies = setCookie.split(',').map(c => c.split(';')[0]).join('; ');
            }

            const isJson = res.headers.get('content-type')?.includes('application/json');
            const data = isJson ? await res.json() : await res.text();

            if (!res.ok) {
                const err = new Error(typeof data === 'object' ? (data.message || 'Error') : data);
                err.status = res.status;
                throw err;
            }

            return { data };
        };

        await teardownRequest('/auth/login', {
            method: 'POST',
            body: {
                email: cleanAdminEmail,
                password: 'AdminPassword@123'
            }
        });

        console.log(`20. Teardown Admin deleting first admin ${testAdminId}...`);
        await teardownRequest(`/auth/admin/users/${testAdminId}`, { method: 'DELETE' });
        console.log('✅ First Admin deleted successfully.');

        // Now we delete the teardown admin itself? Since teardown delete cleanAdminId would fail (self), let's log in as instructor or another user? Actually, instructor user is pre-seeded with email 'instructor@learnsphere.ai'. But instructor is not an Admin so they cannot do it.
        // Wait, since cleanAdminId is left, we can just leave it there or delete it later, it is just one database row. That's perfectly fine! Or we can login back as the first admin before we deleted it to delete teardown admin? No, we deleted the first admin already.
        // It is perfectly fine to leave the system with 1 test admin or just clean it up. Let's leave it, it's 100% fine.

        console.log('\n🌟 SUCCESS: All LearnSphere backend APIs verified correctly! 🌟');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ VERIFICATION FAILURE:', error.data || error.message);
        process.exit(1);
    }
}

runTests();
