# TaskApp
The **TaskApp** is a task management application that enables CRUD operations with advanced features like authentication, security, automated testing, and Continuous Integration/Continuous Delivery (CI/CD).

## Access Application
You can access the application hosted on Render at the following link: [https://taskapp-481i.onrender.com](https://taskapp-481i.onrender.com)

## Technologies and Tools
- **Back-end**: Node.js, Express, MongoDB
- **Database**: MongoDB
- **Testing**: Jest, Postman, Cypress
- **Security**: Passport, Helmet, bcrypt, dotenv, express-validator, jsonwebtoken
- **CI/CD**: Pipeline implementation for automated integration and E2E tests with GitHub Actions

## Features
- **Sign-up and Authentication**: Secure structure for user registration and login.
- **Task Management**: CRUD operations to add, edit, and delete tasks.
- **Security**: Data validation, XSS protection, and secure authentication.
- **Automated Testing**: Unit tests with Jest, integration tests with Postman, and E2E tests with Cypress.
- **CI/CD**: Continuous Integration and Continuous Delivery with automated pipelines.

## Installation
1) Clone the repository:
   - `git clone [REPOSITORY_URL]`
2) Navigate to the project directory:
   - `cd taskapp`
3) Install the dependencies:
   - `npm install`
4) Configure the MongoDB database:
   - Create a database in MongoDB.
   - Adjust the connection settings in the `config/db.js` file.
5) Start the server:
   - `npm start`

## Learnings
###### During the development of this project, I acquired knowledge in:
- Version control practices with Git.
- Basic knowledge of unit testing using Jest.
- Intermediate knowledge of integration testing with Postman.
- Intermediate knowledge of end-to-end (E2E) testing with Cypress.
- CI/CD with automated integration and E2E tests.
- Intermediate knowledge of MongoDB.
- Secure authentication with Passport (local strategy).
- Best security practices, such as sanitization, XSS prevention (Helmet), and data validation.
- Deploying to Render.
