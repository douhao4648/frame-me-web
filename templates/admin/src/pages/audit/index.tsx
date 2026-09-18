import { useState } from 'react';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Button, Descriptions, Drawer, Tag } from 'antd';
import { client } from '../../api/client';
import type { LogVO } from '../../api/gen/audit';

/** 审计日志演示页：ProTable + 契约类型 + 统一请求层的完整链路（数据源 frame-me-audit） */
export default function AuditLogPage() {
  const [detail, setDetail] = useState<LogVO | null>(null);

  const columns: ProColumns<LogVO>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    { title: '操作动作', dataIndex: 'action' },
    { title: '分类', dataIndex: 'category' },
    { title: '操作人', dataIndex: 'operatorId' },
    { title: '来源服务', dataIndex: 'sourceService' },
    {
      title: '结果',
      dataIndex: 'success',
      width: 90,
      valueType: 'select',
      valueEnum: {
        true: { text: '成功', status: 'Success' },
        false: { text: '失败', status: 'Error' },
      },
      render: (_, record) =>
        record.success ? <Tag color="success">成功</Tag> : <Tag color="error">失败</Tag>,
    },
    { title: '耗时(ms)', dataIndex: 'durationMs', width: 100, search: false },
    {
      title: '发生时间',
      dataIndex: 'timestamp',
      valueType: 'dateTimeRange',
      search: {
        // 搜索表单时间区间 → LogQuery.startTime/endTime
        transform: (value: [string, string]) => ({ startTime: value[0], endTime: value[1] }),
      },
      render: (_, record) => record.timestamp,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 80,
      render: (_, record) => [
        <Button key="detail" type="link" size="small" onClick={() => setDetail(record)}>
          详情
        </Button>,
      ],
    },
  ];

  return (
    <>
      <ProTable<LogVO>
        headerTitle="审计日志"
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          const page = await client.page<LogVO>('/api/log/page', {
            ...rest,
            current,
            size: pageSize,
          });
          return { data: page.records, total: page.total, success: true };
        }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
      />
      <Drawer
        open={!!detail}
        width={640}
        title={`日志详情 #${detail?.id ?? ''}`}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="操作动作">{detail.action ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="分类">{detail.category ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="描述">{detail.description ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="操作人">{detail.operatorId ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="业务目标">{detail.targetId ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="来源服务">{detail.sourceService ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="目标服务">{detail.targetService ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="结果">
              {detail.success ? <Tag color="success">成功</Tag> : <Tag color="error">失败</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="耗时">{detail.durationMs ?? '-'} ms</Descriptions.Item>
            <Descriptions.Item label="发生时间">{detail.timestamp ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="方法入参">
              <pre style={{ maxHeight: 200, overflow: 'auto' }}>{formatJson(detail.params)}</pre>
            </Descriptions.Item>
            <Descriptions.Item label="返回值">
              <pre style={{ maxHeight: 200, overflow: 'auto' }}>{formatJson(detail.result)}</pre>
            </Descriptions.Item>
            <Descriptions.Item label="异常信息">{detail.errorMsg ?? '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  );
}

function formatJson(text?: string): string {
  if (!text) return '-';
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}
