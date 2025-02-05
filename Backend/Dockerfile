FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Flask app code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 5002

# Command to run the application using a production WSGI server
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5002", "app:app"]