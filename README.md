# Trustwise Project

Welcome to the Trustwise project repository. This project consists of both a frontend and backend, and we use Docker to containerize the services. Below you'll find information on how to set up and run the project locally, as well as a video walkthrough of the code and the website.

## Project Overview

The Trustwise project is a web application built with react for the frontend and flask for the backend.  Both the services, which can be run in Docker containers using Docker Compose.

## Video Walkthrough



## Prerequisites

Before you begin, make sure you have the following installed on your machine:

- Docker: [Download Docker](https://www.docker.com/products/docker-desktop)
- Docker Compose: Comes bundled with Docker Desktop (on Windows and macOS), otherwise follow [Docker Compose installation guide](https://docs.docker.com/compose/install/)
 Follow the instructions below to clone the repo and run the docker-compose.yml file
once you run clone and run the commands you will see both frontend and backend in your docker with specfied ports where both frontend and backend is hoted
## Setting Up the Project

### 1. Clone the repository

```bash
git clone https://github.com/akthartauqeer/trustwise_project.git
cd trustwise_project

docker-compose up --build

