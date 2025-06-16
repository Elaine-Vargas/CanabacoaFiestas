# Use Node.js LTS version
FROM node:18-alpine3.19

# Update Alpine packages to reduce vulnerabilities
RUN apk update && apk upgrade --no-cache

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY Frontend/package*.json ./Frontend/
COPY Backend/package*.json ./Backend/

# Install dependencies
RUN npm install
RUN cd Frontend && npm install --legacy-peer-deps
RUN cd Backend && npm install --legacy-peer-deps
RUN npm install -g typescript

# Copy the rest of the application
COPY . .

# Build frontend and backend
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 