# 社区志愿服务积分与礼品兑换系统 Dockerfile (国内部署)
FROM node:20-alpine AS builder

WORKDIR /app

# 设置 npm 国内镜像源，加速镜像构建
RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 生产运行镜像
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# 复制构建产物
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# 只安装生产依赖
RUN npm config set registry https://registry.npmmirror.com
RUN npm install --only=production

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
