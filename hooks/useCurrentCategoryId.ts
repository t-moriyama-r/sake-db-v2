'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getLiquorCategoryId } from '@/lib/server/liquors/actions';

/**
 * 現在のパスに対応するカテゴリ ID を返すフック。
 *
 * @param initialValue - SSR で解決済みのカテゴリ ID（直アクセス時のフラッシュ防止用）
 */
export const useCurrentCategoryId = (initialValue?: string | null): string | null => {
  const pathname = usePathname();

  // カテゴリページはパスから同期的に算出
  const categoryMatch = pathname.match(/\/(?:discovery\/)?category\/([^/]+)/);
  const urlCategoryId = categoryMatch?.[1] ?? null;

  const liquorMatch = !categoryMatch ? pathname.match(/^\/liquor\/([^/]+)$/) : null;
  const liquorId = liquorMatch?.[1] ?? null;

  // フェッチ完了まで前の値（initialValue）を保持し、ページ遷移中のフラッシュを防ぐ
  // ※ liquorId の非同期フェッチ結果のみ state で管理する
  const [liquorCategoryId, setLiquorCategoryId] = useState<string | null>(
    initialValue ?? null,
  );

  useEffect(() => {
    if (!liquorId) {
      return;
    }
    let cancelled = false;
    // お酒ページ: サーバー Action 経由でカテゴリIDを取得（fetchLiquor のキャッシュを活用）
    getLiquorCategoryId(liquorId)
      .then((categoryId) => {
        if (!cancelled) setLiquorCategoryId(categoryId);
      })
      .catch((e: unknown) => {
        console.warn('カテゴリID取得に失敗しました:', e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [liquorId]);

  // カテゴリページは同期的に算出した値を直接返す（state 不要）
  if (urlCategoryId !== null) return urlCategoryId;
  // お酒ページはフェッチ結果（またはSSR初期値）を返す
  if (liquorId) return liquorCategoryId;
  return null;
};

