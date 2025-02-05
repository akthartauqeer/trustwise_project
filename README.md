# Trustwise Project

Welcome to the Trustwise project repository. This project consists of both a frontend and backend, and we use Docker to containerize the services. Below you'll find information on how to set up and run the project locally, as well as a video walkthrough of the code and the website.

## Project Overview

The Trustwise project is a web application built with react for the frontend and flask for the backend.  Both the services, which can be run in Docker containers using Docker Compose.

## Video Walkthrough



## Prerequisites

Before you begin, make sure you have the following installed on your machine:

- Docker: [Download Docker](https://www.docker.com/products/docker-desktop)
- Docker Compose: Comes bundled with Docker Desktop (on Windows and macOS), otherwise follow [Docker Compose installation guide](https://docs.docker.com/compose/install/)

## Setting Up the Project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/trustwise.git
cd trustwise

In the root of the project (where docker-compose.yml is located), run the following command to build and start the containers:
docker-compose up --build

then after that you will see both the containers running in you localhost with the ports specified in the docker container