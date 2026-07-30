'use client';

import { useEffect, useState } from 'react';

import AgentMomentQrCode from './AgentMomentQrCode';

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('copy failed');
}

export default function PublicAgentMomentShareActions({
  title,
  agentDisplayName,
}: {
  title: string;
  agentDisplayName: string;
}) {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const copy = async () => {
    try {
      await copyText(url);
      setMessage('分享链接已复制');
    } catch {
      setMessage('复制失败，请从浏览器地址栏复制');
    }
  };

  const share = async () => {
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `看看 ${agentDisplayName} 的成长瞬间`,
          url,
        });
        setMessage('分享面板已打开');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          setMessage('');
          return;
        }
      }
    }
    await copy();
  };

  return (
    <section className="publicMomentShare" aria-labelledby="share-title">
      <div>
        <p className="eyebrow">Share this moment</p>
        <h2 id="share-title">把这一刻分享出去</h2>
        <p>
          下架后这个链接会立即失效；但他人已经保存的截图和外部平台预览无法远程收回。
        </p>
      </div>
      <div className="publicMomentShareActions">
        <button
          className="publicMomentPrimaryAction"
          type="button"
          disabled={!url}
          onClick={() => void share()}
        >
          分享
        </button>
        <button
          className="publicMomentSecondaryAction"
          type="button"
          disabled={!url}
          onClick={() => void copy()}
        >
          复制链接
        </button>
        {url ? (
          <AgentMomentQrCode
            url={url}
            alt={`${agentDisplayName}的成长瞬间分享二维码`}
            downloadName="oc-kindergarten-moment.png"
          />
        ) : null}
      </div>
      <p className="publicMomentShareStatus" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
