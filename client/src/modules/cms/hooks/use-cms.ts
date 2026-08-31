"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { cmsService } from "../services/cms.service";
import {
  Banner,
  Promotion,
} from "../types/cms.types";

export function useCms() {
  const [banners, setBanners] =
    useState<Banner[]>([]);

  const [promotions, setPromotions] =
    useState<Promotion[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadCms = useCallback(async () => {
    try {
      setError("");
      setIsLoading(true);

      const [banners, promotions] =
        await Promise.all([
          cmsService.getBanners(true),
          cmsService.getPromotions(true),
        ]);

      setBanners(banners);
      setPromotions(promotions);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load CMS content.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCms();
  }, [loadCms]);

  return {
    banners,
    promotions,
    isLoading,
    error,
    reload: loadCms,
  };
}