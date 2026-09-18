import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Typography } from 'antd';

export default function Welcome() {
  return (
    <PageContainer title="欢迎使用 {{name}}">
      <ProCard>
        <Typography.Paragraph>
          本工程由 <Typography.Text code>npm init @frame-me</Typography.Text> 生成，基于
          frame-me-web 管理后台模板。
        </Typography.Paragraph>
        <Typography.Title level={5}>常用命令</Typography.Title>
        <ul>
          <li>
            <Typography.Text code>pnpm dev</Typography.Text> — 本地开发
          </li>
          <li>
            <Typography.Text code>pnpm gen:api</Typography.Text> — 从后端 OpenAPI
            重新生成契约类型（服务清单见 frame-me.config.mjs）
          </li>
          <li>
            <Typography.Text code>pnpm build</Typography.Text> — 生产构建
          </li>
        </ul>
        <Typography.Title level={5}>演示</Typography.Title>
        <Typography.Paragraph>
          左侧「审计日志」菜单演示 ProTable + 契约类型 + 统一请求层的完整链路（数据源
          frame-me-audit）。
        </Typography.Paragraph>
      </ProCard>
    </PageContainer>
  );
}
