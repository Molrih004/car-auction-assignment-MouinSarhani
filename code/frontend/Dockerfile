# Build the SvelteKit app to static files, then serve them with nginx
FROM node:24-bookworm-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# The browser talks to the gateway, so this is the address of the gateway as seen from the browser
ARG PUBLIC_API_URL=http://localhost:3000
ENV PUBLIC_API_URL=$PUBLIC_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
