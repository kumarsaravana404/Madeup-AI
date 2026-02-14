# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install pm2 globally
RUN npm install -g pm2

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5001

# Perform the pre-start check for Ollama (optional in build, useful in run)
# We override the start command to use PM2
CMD ["pm2-runtime", "ecosystem.config.js"]
