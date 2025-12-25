// Auth context and hooks

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  plan: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}
