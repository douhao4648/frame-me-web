import { useEffect, useRef, useState } from 'react';
import { Button, Result, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { consumeLoginRedirect } from '../../auth/redirect';
import { ssoLogin } from '../../auth/session';

/**
 * SSO 方式 A 回调落地：RP 后端 /index 落地页校验 state 后，
 * 以 URL hash 携带 code 重定向回本路由（hash 不进服务端日志/Referer）。
 */
export default function SsoCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    // StrictMode 双跑防御：授权码一次性，重复消费必然失败
    if (ran.current) return;
    ran.current = true;

    const code = window.location.hash.match(/code=([^&]+)/)?.[1];
    if (!code) {
      setError('回调地址中未找到授权码');
      return;
    }
    ssoLogin(code)
      .then(() => navigate(consumeLoginRedirect(), { replace: true }))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : '登录失败，请重试'));
  }, [navigate]);

  if (error) {
    return (
      <Result
        status="error"
        title="SSO 登录失败"
        subTitle={error}
        extra={
          <Button type="primary" href="/login">
            返回登录页
          </Button>
        }
      />
    );
  }
  return <Spin fullscreen tip="正在登录…" />;
}
