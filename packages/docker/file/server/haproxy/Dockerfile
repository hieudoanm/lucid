# Use the official HAProxy image from Docker Hub
FROM haproxy:3.3.3

# Copy your custom HAProxy configuration file (optional)
# Replace "haproxy.cfg" with your custom configuration file
COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg

# Expose ports (default HAProxy ports are 80 and 443)
EXPOSE 80 443

# Start HAProxy in the foreground
CMD ["haproxy", "-f", "/usr/local/etc/haproxy/haproxy.cfg"]
