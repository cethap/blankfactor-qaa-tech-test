# Use official Playwright image with Node.js and browsers pre-installed
FROM mcr.microsoft.com/playwright:v1.40.1-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install Playwright browsers (already in base image, but ensures latest)
RUN npx playwright install --with-deps chromium

# Copy project files
COPY . .

# Create reports directory
RUN mkdir -p reports

# Set environment variables
ENV NODE_ENV=test
ENV HEADLESS=true

# Default command to run tests
CMD ["npm", "test"]
