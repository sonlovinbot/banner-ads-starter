// Demo/fake auth mode — dùng khi Supabase chưa cấu hình HOẶC học viên chỉ
// muốn thử app nhanh. Credentials mặc định: admin / pass. Session lưu
// localStorage nên F5 vẫn giữ. Không dùng cho production.

const DEMO_KEY = 'bannerAds:demoAuthUser';

export const DEMO_USER = { username: 'admin', password: 'pass' };

export interface DemoUser {
  id: string;
  email: string;
  user_metadata: { display_name: string };
  isDemo: true;
}

const DEMO_USER_OBJECT: DemoUser = {
  id: 'demo-user-local',
  email: 'admin@demo.local',
  user_metadata: { display_name: 'Demo Admin' },
  isDemo: true,
};

export function isDemoLoggedIn(): boolean {
  try {
    return localStorage.getItem(DEMO_KEY) === '1';
  } catch {
    return false;
  }
}

export function getDemoUser(): DemoUser | null {
  return isDemoLoggedIn() ? DEMO_USER_OBJECT : null;
}

/** Đăng nhập demo với credentials cố định. Trả về true nếu match. */
export function demoSignIn(username: string, password: string): boolean {
  if (username.trim().toLowerCase() === DEMO_USER.username &&
      password === DEMO_USER.password) {
    try { localStorage.setItem(DEMO_KEY, '1'); } catch {}
    return true;
  }
  return false;
}

export function demoSignOut(): void {
  try { localStorage.removeItem(DEMO_KEY); } catch {}
}
