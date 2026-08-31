"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { categoryService } from "../services/category.service";
import { Category } from "../types/catalogue.types";

export function useCategories() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadCategories =
    useCallback(async () => {
      try {
        setError("");
        setIsLoading(true);

        const data =
          await categoryService.getCategories();

        setCategories(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load categories.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoading,
    error,
    reload: loadCategories,
  };
}