FROM node:18-slim

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制项目文件
COPY . .

# 创建输出目录
RUN mkdir -p output

# 暴露端口
EXPOSE 4000

# 启动应用
CMD ["npm", "start"] 