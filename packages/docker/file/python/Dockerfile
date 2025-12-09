FROM python:3.14.2

# Assign environments
ENV ENVIRONMENT='production'
ENV PORT='10000'

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file to the container
COPY requirements.txt .

# Install any dependencies specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code to the container
COPY main.py main.py
COPY Makefile Makefile

# Expose the port the app runs on
EXPOSE $PORT

# Command to run the application
ENTRYPOINT ["python3"]
CMD ["main.py"]
