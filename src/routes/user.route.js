const express = require('express')
const route = express.Router()
const verifyUser = require("../middlewares/user.auth");
const userController = require('../controllers/user.controller')

route.post('/login', userController.login)
route.post('/register', userController.register)
route.get('/get-books', userController.getBooks)
route.get('/user-details', verifyUser, userController.getDetails)
route.get('/borrowed-books', verifyUser, userController.getBorrowBooks)
route.get('/user-inbox', verifyUser, userController.getInbox)
route.get('/book-details/:id', verifyUser, userController.getBookDetails)
route.get('/borrowed-book-details/:id', verifyUser, userController.getBorrowedBookDetails)
route.post('/change-password', verifyUser, userController.changePassword)
route.post('/order-book',verifyUser,userController.orderBook)
route.post('/return-book',verifyUser,userController.returnBook)


module.exports = route