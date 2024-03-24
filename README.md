## Project Description

This project is the backend for an e-commerce application built using Express.js and MongoDB. It provides a robust API for user management, product management, shopping cart functionality, and checkout processes, including discount code validation.

## Installation

To set up this project locally, follow these steps:

1. **Clone the Repository:**
git clone https://github.com/RutvikJogdand/e-comm-backend.git

2. **Install Dependencies:**
Navigate to the project directory and run: npm install

3. **Environment Variables:**
Set up the necessary environment variables in a `.env` file in the root directory. This should include:
- `MONGODB_URI`: MongoDB connection string.
- Any other environment variables you've used in the project.

4. **Start the Server:**
nodemon index.js.
The server should run on port 5000 locally.

## Usage

The API endpoints provided by this backend include:

- **User Management**: Get user information.
- **Product Management**: Add, update, and list products.
- **Cart Management**: Add items to cart, update cart items, and view cart.
- **Checkout Process**: Process checkout including discount code application.

## Testing

For testing, please navigate to: tests/controllers and run: <b> npx jest *filename*.test.js </b>

## Features
- CRUD operations for products.
- Shopping cart functionality.
- Checkout with discount code validation.
- MongoDB transactional support for consistent data state.

## Technologies Used

- **Node.js and Express.js**: For creating the server and API endpoints.
- **MongoDB**: As the database for storing user and product data.
- **Mongoose**: For database schema and model management.
- **Other Libraries**: Jest for testing, mongodb-memory-server for mocking in memory database for testing purposes, supertest: SuperAgent driven library for testing HTTP servers.

## Contributing

Contributions to this project are welcome. Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make changes and commit them (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a new Pull Request.

