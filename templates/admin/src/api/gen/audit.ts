/* eslint-disable */
/**
 * 本文件由 frame-me-gen-api 自动生成，请勿手改。
 * 当前为离线快照（依据 frame-me-audit 的 ILogApi / LogQuery / LogVO 手工对齐，保证模板离线可编译），
 * 后端可用后执行 pnpm gen:api 刷新为 openapi-typescript 生成形态。
 */

/** 审计日志查询参数（list / page 共用，对齐 LogQuery extends PageQuery） */
export interface LogQuery {
  /** 当前页码，默认 1 */
  current?: number;
  /** 每页条数，默认 10 */
  size?: number;
  /** 排序字段列表，格式：字段名[ 方向]，如 ['timestamp desc'] */
  orderBy?: string[];
  /** 操作动作，模糊查询 */
  action?: string;
  /** 操作分类，精确查询 */
  category?: string;
  /** 操作人标识，模糊查询 */
  operatorId?: string;
  /** 操作描述，模糊查询 */
  description?: string;
  /** 来源服务名，精确查询 */
  sourceService?: string;
  /** 是否执行成功，精确查询 */
  success?: boolean;
  /** 事件发生时间起始 */
  startTime?: string;
  /** 事件发生时间截止 */
  endTime?: string;
}

/** 审计日志视图对象（对齐 LogVO） */
export interface LogVO {
  /** 日志 ID */
  id?: number;
  /** 操作动作 */
  action?: string;
  /** 操作分类 */
  category?: string;
  /** 操作描述，已解析占位符 */
  description?: string;
  /** 操作人标识 */
  operatorId?: string;
  /** 业务目标标识 */
  targetId?: string;
  /** 方法入参 JSON */
  params?: string;
  /** 返回值 JSON */
  result?: string;
  /** 是否执行成功 */
  success?: boolean;
  /** 异常信息 */
  errorMsg?: string;
  /** 方法执行耗时，单位毫秒 */
  durationMs?: number;
  /** 事件发生时间 */
  timestamp?: string;
  /** 来源服务名 */
  sourceService?: string;
  /** 目标服务名，为空表示本地事件 */
  targetService?: string;
  /** 入库时间 */
  createTime?: string;
}
