FROM node:18-alpine

WORKDIR /app

# Сначала копируем только манифест зависимостей —
# это позволяет Docker кэшировать слой с npm install
# и не переустанавливать пакеты при изменении только кода
COPY package*.json ./
RUN npm install

# Копируем остальной код приложения
COPY . .

EXPOSE 3000

CMD ["npm", "start"]