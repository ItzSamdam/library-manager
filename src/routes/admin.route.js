const express = require('express')
const route = express.Router()
const verifyAdmin = require("../middlewares/admin.auth");
const adminController = require('../controllers/admin.controller')
const uploadFile = require("../config/mediaHandler")

route.post('/login', adminController.login)
route.get('/get-books', verifyAdmin, adminController.getBooks)
route.get('/admin-details', verifyAdmin, adminController.getDetails)
route.get('/borrowed-books', verifyAdmin, adminController.getBorrowBooks)
route.get('/inbox', verifyAdmin, adminController.getInbox)
route.get('/book-details/:id', verifyAdmin, adminController.getBookDetails)
route.get('/borrowed-book-details/:id', verifyAdmin, adminController.getBorrowedBookDetails)
route.post('/change-password', verifyAdmin, adminController.changePassword)
route.get('/get-users', verifyAdmin, adminController.getUsers)
route.post('/delete-book', verifyAdmin, adminController.deleteBooks)
route.post('/update-book', verifyAdmin, adminController.updateBook)
route.post('/add-book', uploadFile.single('image'), adminController.addBook)
route.post('/approve-book-request', verifyAdmin, adminController.approveBookRequest)
route.post('/send-message', verifyAdmin, adminController.sendMessage)

module.exports = route