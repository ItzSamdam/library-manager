const logger = require( "../config/logger");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HttpStatus = require('http-status');
const {PrismaClient} = require("@prisma/client");

const adminModel = new PrismaClient().admin;
const bookModel = new PrismaClient().book;
const inboxModel = new PrismaClient().inbox;
const bookRequestModel = new PrismaClient().bookRequest;
const userModel = new PrismaClient().user;
const login = async (req, res) => {
    try {

        let query = await adminModel.findUnique({
            where: { emailAddress: req.body.email }
        })
        if (query) {
            let checker = await bcrypt.compare(req.body.password, query.password)
            if (checker) {
                const accessToken = await jwt.sign(
                    {
                        id: query.id
                    },
                    process.env.AUTH_ADMIN_TOKEN,
                    {expiresIn: '2h'}
                )
                res.setHeader('admin-authToken', accessToken)
                res.cookie('admin-authToken', accessToken, {
                    httpOnly: true,
                    maxAge: 2 * 60 * 60 * 1000,
                    sameSite: 'None'
                })

                return res.status(HttpStatus.OK).json({
                    statusCode: HttpStatus.OK,
                    success: true,
                    message: 'Login successful',
                    accessToken: accessToken
                })
            }
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                success: false,
                message: "Invalid Credentials",
            })
        }
        return res.status(HttpStatus.NOT_FOUND).json({
            statusCode: HttpStatus.NOT_FOUND,
            success: false,
            message: "Account not found",
        })
    } catch (e) {
        logger.error(e)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Technical error occurred',
            error: e.message
        })
    }

}

const getBooks = async (req, res) => {
    try {
        let query = await bookModel.findMany();
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            success: true,
            message: 'books retrieved',
            data: query
        })
    } catch (e) {
        logger.error(e)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Technical error occurred',
            error: e.message
        })
    }

}
const getInbox = async (req, res) => {
    try {
        let query = await inboxModel.findMany(
            {
                include: {
                  book: true,
                  user: true
                }
            })

        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            success: true,
            message: 'inbox message fetched',
            data: query
        })
    } catch (e) {
        logger.error(e)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Technical error occurred',
            error: e.message
        })
    }
}

const getUsers = async (req, res) => {
    try {
        let query = await userModel.findMany()

        return res.status(HttpStatus.OK).json({
            statusCode:HttpStatus.OK,
            success: true,
            message: 'users fetched successfully',
            data:query
        })
    } catch (e) {
        logger.error(e)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Technical error occurred',
            error: e.message
        })
    }

}
const getDetails = async (req, res) => {
    try {
        let query = await adminModel.findUnique({
            where: {
                id: req.admin_id
            },
        })
        if (query) {
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                success: true,
                message: 'admin details fetched',
                details: query
            })
        }
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            success: false,
            message: 'user not found'
        })
    } catch (e) {
        
        logger.error(e)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Technical error occurred',
            error: e.message
        })
    }

}

const getBookDetails = async (req, res) => {
    try {
        let query = await bookModel.findUnique({
            where: {
                id: req.params.id
            }
        })
        if (query) {
            return res.status(HttpStatus.OK).json({
                statusCode:HttpStatus.OK,
                success: true,
                message: 'book details fetched ',
                details: query
            })
        }
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            success: false,
            message: 'book not found ',
        })
    } catch (e) {
        
        logger.error(e)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Technical error occurred',
            error: e.message
        })
    }


}

const getBorrowedBookDetails = async (req, res) => {
    try {
        let query = await bookRequestModel.findUnique({
            where: {
                id: req.params.id
            },
            include: {
                book: true
            }
        })
        if (query) {
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                success: true,
                message: 'borrowed book details fetched ',
                details: query
            })
        }
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            success: false,
            message: 'borrowed book not found ',
        })
    } catch (e) {
        logger.error(e)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Technical error occurred',
            error: e.message
        })
    }
}

const changePassword = async (req, res) => {
    try {

        let query = await adminModel.findUnique({
            where: {
                id: req.body.id
            },
        })
        if (query) {
            let checker = await bcrypt.compare(req.body.oldPassword, query.password)
            if (checker) {
                let password = await bcrypt.hash(req.body.password, 10)
                let create = await adminModel.update({
                    where: {
                        id: req.body.id
                    },
                    data: {
                        password
                    },
                })
                if (create) {
                    return res.status(HttpStatus.OK).json({
                        statusCode: HttpStatus.OK,
                        success: true,
                        message: 'password changed successfully'
                    })
                }
                return res.status(HttpStatus.BAD_REQUEST).json({
                    statusCode: HttpStatus.BAD_REQUEST,
                    success: false,
                    message: 'Unable to change user password'
                })
            }
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                success: false,
                message: 'Incorrect old Password'
            })

        }
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            success: false,
            message: 'Admin not found'
        })

    } catch (e) {
        logger.error(e)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Technical error occurred',
            error: e.message
        })
    }


}
const getBorrowBooks = async (req, res) => {
    try {
        let query = await bookRequestModel.findMany(
            {
                include: {
                    book: true,
                    user: true
                },
            })

        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            success: true,
            message: 'borrowed books fetched',
            data: query
        })
    } catch (e) {
        logger.error(e)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Technical error occurred',
            error: e.message
        })
    }
}
const deleteBooks = async (req, res) => {
    try {
        let deleteInbox = await inboxModel.delete({
            where: { bookId: req.body.id }
        })
        let sql = await bookRequestModel.delete({
            where:{ bookId:req.body.id }
        })
        let query = await bookModel.delete({
            where: { id: req.body.id }
        });

        if (deleteInbox && sql && query) return res.status(HttpStatus.NO_CONTENT).json({
            statusCode: HttpStatus.NO_CONTENT,
            success: true,
            message: 'Book deleted successfully'
        })
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            success: false,
            message: 'unable to delete book'
        })
    } catch (e) {
        
        logger.error(e)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Technical error occurred',
            error: e.message
        })
    }


}
const updateBook = async (req, res) => {
    try {
        let query = await bookModel.update({
            where: { id: req.body.id },
            data: { ...req.body }
        });

        if (query) return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            success: true,
            message: 'Book details updated successfully'
        })
        return res.status().json({
            status: false,
            message: 'unable to update book details'
        })
    } catch (e) {
        
        logger.error(e)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Technical error occurred',
            error: e.message
        })
    }


}
const addBook = async (req, res) => {
    try {
        let image=`/media/${req.file.filename}`;
        let query = await bookModel.create({
            image,
            ...req.body
        });

        if (query) return res.status(HttpStatus.CREATED).json({
            statusCode: HttpStatus.CREATED,
            success: true,
            message: 'Book added successfully'
        })
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            success: false,
            message: 'unable to add book '
        })
    } catch (e) {
        
        logger.error(e)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Technical error occurred',
            error: e.message
        })
    }


}

const approveBookRequest = async (req, res) => {
    try {
        let query = await bookRequestModel.update({
            where: {id: req.body.id},
            data: {status: req.body.status}
        })
        let sql = await bookModel.update({
            where: { id: req.body.bookId },
            data: { status: req.body.status ===2 ? 0 : 1 }
        })
        if (query && sql) return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            success: true,
            message: 'Book request updated successfully'
        })
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            success: false,
            message: 'unable to update book request'
        })

    } catch (e) {
        logger.error(e)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Technical error occurred',
            error: e.message
        })
    }
}
const sendMessage = async (req, res)=>{
    try{
        let query = await inboxModel.create({
            ...req.body
        })

        if (query) return res.status(HttpStatus.CREATED).json({
            statusCode: HttpStatus.CREATED,
            success: true,
            message: 'Message sent successfully'
        })
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            success: false,
            message: 'unable to send message'
        })
    } catch (e) {
        logger.error(e)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Technical error occurred',
            error: e.message
        })
    }

}
module.exports = {
    login,
    getDetails,
    getBookDetails,
    getBorrowedBookDetails,
    changePassword,
    getBooks,
    getInbox,
    getBorrowBooks,
    getUsers,
    deleteBooks,
    updateBook,
    approveBookRequest,
    addBook,
    sendMessage
}