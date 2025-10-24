# Nano Banana - 支付系统配置指南

## 概述

Nano Banana集成了Creem支付系统，提供完整的订阅管理和支付处理功能。

## 已实现功能

### 🎯 核心功能
- **定价页面**: `/pricing` - 展示三种订阅方案（Free、Pro、Enterprise）
- **支付集成**: Creem支付API完整集成
- **订阅管理**: 自动处理订阅创建、更新和取消
- **积分系统**: 基于订阅计划的AI积分管理
- **Webhook处理**: 安全的支付状态回调处理

### 🏗️ 技术架构
- **前端**: Next.js 15 + React 19 + TypeScript
- **支付处理**: Creem API
- **数据库**: Supabase PostgreSQL
- **安全性**: Webhook签名验证 + RLS政策

## 配置步骤

### 1. Creem账户设置

1. 注册[Creem账户](https://creem.io)
2. 创建API密钥
3. 配置Webhook端点: `https://yourdomain.com/api/creem/webhook`
4. 获取以下凭证:
   - API密钥
   - Webhook签名密钥

### 2. 环境变量配置

在`.env.local`中添加以下配置:

```env
# Creem Payment Configuration
CREEM_API_KEY=your_creem_api_key_here
CREEM_API_BASE=https://api.creem.io
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. 数据库设置

在Supabase中运行`database/migrations/20240101000001_create_subscriptions.sql`中的SQL语句，创建必要的表和索引。

## API端点

### 支付相关

- `POST /api/creem/create-payment` - 创建支付会话
- `GET /api/payment/verify` - 验证支付状态
- `POST /api/creem/webhook` - Creem Webhook处理

### 页面路由

- `/pricing` - 定价页面
- `/payment/success` - 支付成功页面

## 订阅方案

### Free Plan (免费)
- **价格**: $0
- **积分**: 10个AI积分/月
- **功能**: 基础图像编辑、标准质量输出

### Pro Plan (专业版)
- **价格**: $9.99/月
- **积分**: 500个AI积分/月
- **功能**: 高级编辑、HD质量、商业使用权

### Enterprise Plan (企业版)
- **价格**: $29.99/月
- **积分**: 2000个AI积分/月
- **功能**: 4K输出、API访问、团队协作

## 数据库表结构

### user_subscriptions
- 用户订阅信息
- 与Creem的客户和订阅ID关联
- 支持订阅状态跟踪

### user_credits
- 用户AI积分管理
- 自动积分重置和累计

### payment_transactions
- 支付交易记录
- 完整的审计日志

## 安全特性

### Webhook安全
- HMAC-SHA256签名验证
- 防重放攻击保护
- 事件类型验证

### 数据库安全
- Row Level Security (RLS)
- 用户数据隔离
- 服务角色权限控制

## 错误处理

### 常见错误代码
- `400`: 缺少必要参数
- `401`: 无效的Webhook签名
- `500`: 服务器内部错误

### 调试工具
- 详细的控制台日志
- 错误追踪和报告
- 支付状态验证

## 部署注意事项

### 生产环境配置
1. 更新`NEXT_PUBLIC_SITE_URL`为实际域名
2. 配置HTTPS
3. 设置适当的CORS策略
4. 配置监控和日志

### 性能优化
- 数据库索引优化
- API响应缓存
- CDN配置

## 测试

### 本地测试
```bash
# 启动开发服务器
npm run dev

# 访问定价页面
http://localhost:3000/pricing
```

### 测试支付流程
1. 使用Creem测试环境
2. 测试各种支付场景
3. 验证Webhook事件处理
4. 检查数据库状态更新

## 监控和维护

### 关键指标
- 支付成功率
- 订阅转化率
- Webhook处理延迟
- 数据库性能

### 日志监控
- 支付API调用
- Webhook事件处理
- 数据库操作日志
- 错误追踪

## 故障排除

### 常见问题

1. **支付失败**
   - 检查API密钥配置
   - 验证网络连接
   - 查看Creem仪表板状态

2. **Webhook不工作**
   - 验证端点可访问性
   - 检查签名密钥
   - 查看Creem Webhook日志

3. **数据库问题**
   - 确认迁移已运行
   - 检查RLS政策
   - 验证用户权限

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 完整支付系统集成
- 三种订阅方案
- Webhook安全处理

## 支持

如有问题，请联系:
- 技术支持: tech@nanobanana.ai
- 商务合作: business@nanobanana.ai
- GitHub Issues: [项目Issues页面]

## 许可证

MIT License - 详见LICENSE文件