# Use the official NGINX image as a base image
FROM nginx:1.29.7

# Copy the custom nginx.conf to the container
# Replace "nginx.conf" with your custom configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static website files (if applicable)
# Replace "html/" with the directory containing your static files
COPY html/ /usr/share/nginx/html/

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
