FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_BASE
ARG VITE_FRONTEND_URL
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
RUN npm run build

FROM nginx:alpine
RUN echo "server { listen 3001; server_name _; root /usr/share/nginx/html; index index.html; location / { try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]
