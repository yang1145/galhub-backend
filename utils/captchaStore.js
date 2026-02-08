// 共享的验证码存储模块
// 在生产环境中建议使用Redis等外部存储

class CaptchaStore {
  constructor() {
    this.store = new Map();
    // 定期清理过期验证码（每分钟一次）
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredCaptchas();
    }, 60 * 1000);
  }

  // 存储验证码
  set(captchaId, captchaData) {
    this.store.set(captchaId, {
      text: captchaData.text.toLowerCase(),
      expiresAt: Date.now() + 5 * 60 * 1000 // 5分钟过期
    });
  }

  // 获取验证码
  get(captchaId) {
    return this.store.get(captchaId);
  }

  // 删除验证码
  delete(captchaId) {
    return this.store.delete(captchaId);
  }

  // 清理过期的验证码
  cleanupExpiredCaptchas() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  // 关闭清理定时器
  close() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// 导出单例实例
const captchaStore = new CaptchaStore();

module.exports = captchaStore;