# 社区志愿服务积分与礼品兑换系统 Dockerfile (TCB 腾讯云 / 微信云托管优化版)
FROM node:20-slim AS builder

WORKDIR /app

# 复制 package.json，避免跨平台 lock 文件冲突
COPY package*.json ./

# 安装完整依赖（使用腾讯云加速源与 npmmirror 镜像源，提升国内构建速度）
RUN npm install --legacy-peer-deps --registry=https://mirrors.cloud.tencent.com/npm/ || npm install --legacy-peer-deps --registry=https://registry.npmmirror.com || npm install --legacy-peer-deps

COPY . .

# 执行打包
RUN npm run build

# 生产运行镜像 (使用 glibc 兼容性极佳的 debian-slim)
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# 复制构建产物及预置数据
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# 只安装生产依赖（优先使用腾讯云内网源/npmmirror）
RUN npm install --omit=dev --legacy-peer-deps --registry=https://mirrors.cloud.tencent.com/npm/ || npm install --omit=dev --legacy-peer-deps --registry=https://registry.npmmirror.com || npm install --omit=dev --legacy-peer-deps

EXPOSE 8080 80 3000

CMD ["node", "dist/server.cjs"]
