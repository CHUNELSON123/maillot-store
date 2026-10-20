import { apiClient } from "@/services/api/api-client";
import { authStorage } from "@/lib/auth/auth-storage";
import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "../types/auth.types";

import { wishlistService } from "@/modules/wishlist/services/wishlist.service";
import { cartService } from "@/modules/cart/services/cart.service";

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

    authStorage.setToken(response.accessToken);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("maillot-auth-updated"));
    }

    try {
        await wishlistService.syncGuestItems();
      } catch (error) {
        console.error("Failed to merge guest wishlist:", error);
      }

    try {
        await cartService.syncGuestItems();
      } catch (error) {
        console.error("Failed to merge guest cart:", error);
      }

    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

    return response;
  },

  async getMe(): Promise<AuthUser> {
    const token = authStorage.getToken();

    if (!token) {
      throw new Error("No authentication token found.");
    }

    return apiClient<AuthUser>(
      "/auth/me",
      {
        method: "GET",
        token,
      },
    );
  },

  logout(): void {
    authStorage.removeToken();
    cartService.resetCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("maillot-cart-updated"));
      window.dispatchEvent(new Event("maillot-auth-updated"));
    }
  },
};
