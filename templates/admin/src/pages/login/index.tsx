import { LoginOutlined } from '@ant-design/icons';
import { Button, Card, Typography } from 'antd';
import { redirectToSso } from '../../auth/redirect';

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 360, textAlign: 'center' }}>
        <Typography.Title level={3}>{'{{name}}'}</Typography.Title>
        <Typography.Paragraph type="secondary">
          frame-me 管理后台 · SSO 统一认证
        </Typography.Paragraph>
        <Button type="primary" size="large" icon={<LoginOutlined />} block onClick={redirectToSso}>
          使用 SSO 登录
        </Button>
      </Card>
    </div>
  );
}
