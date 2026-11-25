const ACCESS_TOKEN_KEY = "maillot_store_access_token";

export const authStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // Staff sessions do not have customer profiles. Keep their storefront cart
  // and wishlist in guest storage without changing their administrator session.
  getStorefrontToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const role = (JSON.parse(atob(payload)) as { roleName?: string }).roleName;
      return role === 'Administrator' || role === 'Staff' ? null : token;
    } catch {
      return token;
    }
  },

  setToken(token: string): void {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  removeToken(): void {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  hasToken(): boolean {
    return this.getToken() !== null;
  },
};
