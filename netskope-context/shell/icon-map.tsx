'use client';

import {
  HomeIcon,
  AlertIcon,
  AiIcon,
  AiOpsIcon,
  SkopeitIcon,
  PolicyIcon,
  IconCloudIcon,
  ChartBarIcon,
  NetworkIcon,
  BorderlessWanIcon,
  DeviceIcon,
  AppCategoryIcon,
  SettingsIcon,
  UserStarIcon,
  AngleRightIcon,
  AngleLeftIcon,
} from '@netskope-ui/icons';
import type { ComponentType, SVGProps } from 'react';

/**
 * Maps the `iconName` string in nav-config.ts to a real React component from
 * @netskope-ui/icons. Keys here are deliberately keyword-style (`home`, `ai-ops`)
 * so swapping an icon is one line.
 *
 * When a key is unmapped, NavIcon renders an empty 16x16 placeholder — better
 * to fall back silently than break layout.
 */

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

export const ICON_MAP: Record<string, IconCmp> = {
  home: HomeIcon,
  alert: AlertIcon,
  ai: AiIcon,
  'ai-ops': AiOpsIcon,
  skopeit: SkopeitIcon,
  policy: PolicyIcon,
  cloud: IconCloudIcon,
  chart: ChartBarIcon,
  network: NetworkIcon,
  'borderless-wan': BorderlessWanIcon,
  device: DeviceIcon,
  'app-category': AppCategoryIcon,
  gear: SettingsIcon,
  'user-star': UserStarIcon,
};

export const ChevronRight = AngleRightIcon;
export const ChevronLeft = AngleLeftIcon;
