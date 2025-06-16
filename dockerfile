# Use Node.js LTS version
FROM node:18-alpine3.19

# Update Alpine packages to reduce vulnerabilities
RUN apk update && apk upgrade --no-cache

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN cd frontend && npm install --legacy-peer-deps
RUN cd backend && npm install --legacy-peer-deps
RUN npm install -g typescript

# Copy the rest of the application
COPY . .

# Build frontend and backend
RUN cd frontend && npm run build
RUN cd ../backend && npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 