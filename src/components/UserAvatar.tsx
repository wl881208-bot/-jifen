import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  avatar?: string | null;
  name?: string;
  className?: string;
  imgClassName?: string;
  textClassName?: string;
  fallbackEmoji?: string;
}

export function isAvatarUrl(avatar?: string | null): boolean {
  if (!avatar || typeof avatar !== 'string') return false;
  const trimmed = avatar.trim();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/')
  );
}

export function normalizeAvatarUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('http://thirdwx.qlogo.cn')) {
    return trimmed.replace('http://thirdwx.qlogo.cn', 'https://thirdwx.qlogo.cn');
  }
  if (trimmed.startsWith('http://wx.qlogo.cn')) {
    return trimmed.replace('http://wx.qlogo.cn', 'https://wx.qlogo.cn');
  }
  return trimmed;
}

export function getRealPhone(phone?: string | null, userId?: string): string {
  if (!phone || typeof phone !== 'string') return '';
  const trimmed = phone.trim();
  if (!trimmed) return '';
  // Filter out legacy auto-generated fake masked phone numbers on WeChat accounts
  if (userId && userId.startsWith('user_wx_') && /^138\*{4}\d{4}$/.test(trimmed)) {
    return '';
  }
  return trimmed;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name = '用户头像',
  className = '',
  imgClassName = 'w-full h-full rounded-full object-cover',
  textClassName = '',
  fallbackEmoji = '👤',
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [avatar]);

  if (isAvatarUrl(avatar) && !imgError && avatar) {
    return (
      <span className={`inline-flex items-center justify-center overflow-hidden shrink-0 ${className}`}>
        <img
          src={normalizeAvatarUrl(avatar)}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className={imgClassName}
        />
      </span>
    );
  }

  const displayEmoji = !avatar || isAvatarUrl(avatar) ? fallbackEmoji : avatar;

  return (
    <span className={`inline-flex items-center justify-center shrink-0 select-none ${className} ${textClassName}`}>
      {displayEmoji}
    </span>
  );
};

export default UserAvatar;
