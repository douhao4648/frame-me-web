/* eslint-disable */
/**
 * 本文件由 frame-me-gen-api 自动生成，请勿手改。
 * 重新生成：pnpm gen:api
 */

/** 统一响应结构（对齐 frame-me-parent Result<T>） */
export interface IResult<T> {
  code: number;
  msg: string;
  data: T;
  err?: string | null;
  rid?: string | null;
}

/** 分页出参（对齐 frame-me-parent PageData<T>） */
export interface PageData<T> {
  current: number;
  size: number;
  total: number;
  pages: number;
  records: T[];
}

/** 分页响应便捷类型 */
export type PageResult<T> = IResult<PageData<T>>;
