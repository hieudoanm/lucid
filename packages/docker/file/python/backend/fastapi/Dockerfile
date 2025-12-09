# Use an official Python runtime as a parent image
FROM python:3.14.2

# Assign environments
ENV PORT='8080'

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file to the container
COPY requirements.txt .

# Install any dependencies specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code to the container
COPY . .

# Expose the port the app runs on
EXPOSE $PORT

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT"]
