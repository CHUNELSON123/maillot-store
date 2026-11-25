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

  const [content, setContent] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadCms = useCallback(async () => {
    try {
      setError("");
      setIsLoading(true);

      const [banners, promotions, content] =
        await Promise.allSettled([
          cmsService.getBanners(),
          cmsService.getPromotions(),
          cmsService.getPublicContent(),
        ]);

      if (banners.status === "fulfilled") setBanners(banners.value);
      if (promotions.status === "fulfilled") setPromotions(promotions.value);
      if (content.status === "fulfilled") setContent(content.value);
      if ([banners, promotions, content].some((result) => result.status === "rejected")) setError("Some store content could not be loaded.");
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
    content,
    isLoading,
    error,
    reload: loadCms,
  };
}
