"use client";

import { useEffect } from "react";
import { primeSettingsCache } from "../lib/settingsCache";

// كومبوننت مخفي بيتحط مرة واحدة في app/layout.js — مهمته الوحيدة إنه يجيب
// إعدادات الموقع من الـ API أول ما الصفحة تفتح ويحطها في الـ cache بتاع
// lib/settingsCache.js، عشان waLink() تقدر تقراها sync في أي مكان بعد كده.
export default function SettingsLoader() {
  useEffect(() => {
    primeSettingsCache();
  }, []);

  return null;
}
