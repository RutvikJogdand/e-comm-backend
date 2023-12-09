const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { addToCart } = require('./../../controllers/users_controller'); // Adjust the path as needed
const Users = require('../../models/users_model'); // Adjust path as needed
const Products = require('../../models/products_model'); // Adjust path as needed
const usersData = require("./../../users");
const productsData = require("./../../products");

describe('addToCart Function', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryReplSet.create({
            replSet: { storageEngine: 'wiredTiger' }
        });
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        // Clear the collections before each test
        await Users.deleteMany({});
        await Products.deleteMany({});
    });

    test('addToCart should add products to a user cart successfully', async () => {
        // Mock data
        const user = {
            id: "01HGXMEAC37A4R583EH61F70V4",
            first_name: "Theresina",
            last_name: "Ipsly",
            email: "tipsly1@jiathis.com",
            gender: "Female",
            cart: [],
            no_of_orders: 0,
            total:0,
            ordersHistory: []
        };
        const products = [
            {
                product_id: 1,
                product_name: "Beef - Ox Tongue",
                price: 635,
                quantity: 5,
              },
              {
                product_id: "01HGXN5PN8565TF0W27P7BV0FZ",
                product_name: "Milk - Skim",
                price: 992,
                quantity: 5,
              },
              {
                product_id: "01HGXN5PN8G68T9Q68MWR4DCS2",
                product_name: "Cookie Dough - Peanut Butter",
                price: 312,
                quantity: 5,
              },
        ];

        // Mock request and response
        const req = {
            body: {
                user_id: user.id,
                products_arr: products,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        // Creating users and products in the database
        await Promise.all(usersData.map(user => new Users(user).save()))
        await Promise.all(productsData.map(product => new Products(product).save()));

        await addToCart(req, res);

        // Assertions
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('Products updated successfully');

    });

    test('addToCart should abort because user is not found', async () => {
        const user = {
            id: "XYZ123",
            first_name: "Theresina",
            last_name: "Ipsly",
            email: "tipsly1@jiathis.com",
            gender: "Female",
            cart: [],
            no_of_orders: 0,
            total:0,
            ordersHistory: []
        };
        const products = [
            {
                product_id: 1,
                product_name: "Beef - Ox Tongue",
                price: 635,
                quantity: 5,
              },
              {
                product_id: "01HGXN5PN8565TF0W27P7BV0FZ",
                product_name: "Milk - Skim",
                price: 992,
                quantity: 5,
              },
              {
                product_id: "01HGXN5PN8G68T9Q68MWR4DCS2",
                product_name: "Cookie Dough - Peanut Butter",
                price: 312,
                quantity: 5,
              },
        ];

        const req = {
            body: {
                user_id: user.id,
                products_arr: products,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        await Promise.all(usersData.map(user => new Users(user).save()))
        await Promise.all(productsData.map(product => new Products(product).save()));

        await addToCart(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('User not found');

    });

});
