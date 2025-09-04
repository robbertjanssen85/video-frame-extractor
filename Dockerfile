FROM node:18-alpine

# Install ffmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create directories for uploads and outputs
RUN mkdir -p public/uploads public/frames

# Build the application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]