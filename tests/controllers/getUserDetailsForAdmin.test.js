const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Users = require('../../models/users_model'); // Adjust path as needed
const Products = require('../../models/products_model'); // Adjust path as needed
const { generateDiscountCodes, getUserDetailsForAdmin } = require('./../../controllers/users_controller');


jest.mock('./../../controllers/users_controller', () => ({
  ...jest.requireActual('./../../controllers/users_controller'), // Import and spread all actual exports
  generateDiscountCodes : jest.fn() // Mock generateDiscountCodes function
}));

describe('getUserDetailsForAdmin Function', () => {
  let mongoServer;

  beforeAll(async () => {
      //Connect to mock server
      mongoServer = await MongoMemoryReplSet.create({
          replSet: { storageEngine: 'wiredTiger' }
      });
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
      //Disconnect server
      await mongoose.disconnect();
      await mongoServer.stop();
  });

  beforeEach(async () => {
      // Clear the collections before each test
      await Users.deleteMany({});
      await Products.deleteMany({});
  });

  test('getUserDetailsForAdmin return error because user is not found', async () => {
    generateDiscountCodes.mockReturnValue(generateDiscountCodes());
      // Mock data
      const user = {
        id: "01HGXMEAC2C48G3TAK6C6GY3EB",
        first_name: "Rochella",
        last_name: "Keddey",
        email: "rkeddey0@engadget.com",
        gender: "Female",
        cart: [
          {
            product_id: "01HGXN5PNAYA4HSEK5T2TDYFY2",
            product_name: "Dill - Primerba, Paste",
            price: 313,
            quantity: 2,
          },
        ],
        no_of_orders: 5,
        total: 563.4,
        ordersHistory: [
          {
            products: [
              {
                product_id: "01HGXN5PN9BZ7Q1GET6XFPSJK8",
                product_name: "Plastic Arrow Stir Stick",
                price: 912,
                quantity: 2,
              },
            ],
            totalSum: 1824,
          },
          {
            products: [
              {
                product_id: "01HGXN5PN8G68T9Q68MWR4DCS2",
                product_name: "Cookie Dough - Peanut Butter",
                price: 312,
                quantity: 5,
              },
            ],
            totalSum: 1560,
          },
          {
            products: [
              {
                product_id: "01HGXN5PN8565TF0W27P7BV0FZ",
                product_name: "Milk - Skim",
                price: 992,
                quantity:5 ,
              },
            ],
            totalSum: 4960,
          },
          {
            products: [
              {
                product_id: "01HGXN5PNAZSXWFBRHV6TKYP7Y",
                product_name: "Island Oasis - Cappucino Mix",
                price: 530,
                quantity: 2,
              },
            ],
            totalSum: 1060,
          },
          {
            products: [
              {
                product_id: "01HGXN5PNAYA4HSEK5T2TDYFY2",
                product_name: "Dill - Primerba, Paste",
                price: 313,
                quantity: 2,
              },
            ],
            totalSum: 626,
          },
        ],
      };

      // Mock request and response
      const req = {
          body: {
              user_id: "1X2B", 
          },
      };
      const res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn()          
      };

      // Creating users and products in the database
      await new Users(user).save()

      await getUserDetailsForAdmin(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("User not found");

  });

  test('getUserDetailsForAdmin return user details', async () => {
    generateDiscountCodes.mockReturnValue(generateDiscountCodes());
      // Mock data
      const user = {
        id: "01HGXMEAC2C48G3TAK6C6GY3EB",
        first_name: "Rochella",
        last_name: "Keddey",
        email: "rkeddey0@engadget.com",
        gender: "Female",
        cart: [
          {
            product_id: "01HGXN5PNAYA4HSEK5T2TDYFY2",
            product_name: "Dill - Primerba, Paste",
            price: 313,
            quantity: 2,
          },
        ],
        no_of_orders: 5,
        total: 563.4,
        ordersHistory: [
          {
            products: [
              {
                product_id: "01HGXN5PN9BZ7Q1GET6XFPSJK8",
                product_name: "Plastic Arrow Stir Stick",
                price: 912,
                quantity: 2,
              },
            ],
            totalSum: 1824,
          },
          {
            products: [
              {
                product_id: "01HGXN5PN8G68T9Q68MWR4DCS2",
                product_name: "Cookie Dough - Peanut Butter",
                price: 312,
                quantity: 5,
              },
            ],
            totalSum: 1560,
          },
          {
            products: [
              {
                product_id: "01HGXN5PN8565TF0W27P7BV0FZ",
                product_name: "Milk - Skim",
                price: 992,
                quantity:5 ,
              },
            ],
            totalSum: 4960,
          },
          {
            products: [
              {
                product_id: "01HGXN5PNAZSXWFBRHV6TKYP7Y",
                product_name: "Island Oasis - Cappucino Mix",
                price: 530,
                quantity: 2,
              },
            ],
            totalSum: 1060,
          },
          {
            products: [
              {
                product_id: "01HGXN5PNAYA4HSEK5T2TDYFY2",
                product_name: "Dill - Primerba, Paste",
                price: 313,
                quantity: 2,
              },
            ],
            totalSum: 626,
          },
        ],
      };

      // Mock request and response
      const req = {
          body: {
              user_id: "01HGXMEAC2C48G3TAK6C6GY3EB", 
          },
      };
      const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()          
      };

      // Creating users and products in the database
      await new Users(user).save()

      await getUserDetailsForAdmin(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: expect.any(Object)
    });

  });

});
