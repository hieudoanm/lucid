# Use the official Apache HTTP Server image as a base image
FROM httpd:2.4.66

# Copy custom Apache configuration file (optional)
# Replace "httpd.conf" with your custom configuration file
COPY httpd.conf /usr/local/apache2/conf/httpd.conf

# Copy static website files (if applicable)
# Replace "html/" with the directory containing your static files
COPY html/ /usr/local/apache2/htdocs/

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start Apache HTTP Server
CMD ["httpd-foreground"]
