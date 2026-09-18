import { AuditOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import { App as AntApp, Dropdown, Spin } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../auth/session';
import { useAuth } from '../stores/auth';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { message } = AntApp.useApp();

  if (loading) {
    return <Spin fullscreen tip="加载中…" />;
  }

  return (
    <ProLayout
      title="{{name}}"
      logo={false}
      location={{ pathname: location.pathname }}
      route={{
        path: '/',
        routes: [
          { path: '/welcome', name: '首页', icon: <HomeOutlined /> },
          { path: '/audit', name: '审计日志', icon: <AuditOutlined /> },
        ],
      }}
      menuItemRender={(item, dom) => (item.path ? <Link to={item.path}>{dom}</Link> : dom)}
      avatarProps={{
        title: user?.nickname ?? user?.account ?? '未登录',
        size: 'small',
      }}
      actionsRender={() => [
        <Dropdown
          key="user"
          menu={{
            items: [{ key: 'logout', icon: <LogoutOutlined />, label: '退出登录' }],
            onClick: ({ key }) => {
              if (key !== 'logout') return;
              void (async () => {
                await logout();
                void message.success('已退出登录');
                navigate('/login', { replace: true });
              })();
            },
          }}
        >
          <span style={{ cursor: 'pointer' }}>{user?.nickname ?? user?.account ?? '用户'}</span>
        </Dropdown>,
      ]}
    >
      <Outlet />
    </ProLayout>
  );
}
