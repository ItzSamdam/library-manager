const logger = require( "../config/logger");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {PrismaClient} = require("@prisma/client");
const HttpStatus = require('http-status');

const bookModel = new PrismaClient().book;
const inboxModel = new PrismaClient().inbox;
const bookRequestModel = new PrismaClient().bookRequest;
const userModel = new PrismaClient().user;

const register = async (req, res) => {

    try {
        let find = await userModel.findUnique({
            where: { email: req.body.email }
        })
        if (find === null) {
            let payload = {...req.body}
            payload.password = await bcrypt.hash(req.body.password, 10)
            let query = await userModel.create({...payload})
            if (query) {
                return res.status(HttpStatus.CREATED).json({
                    statusCode: HttpStatus.CREATED,
                    success: true,
                    message: 'Account created successfully'
                })
            }
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                success: false,
                message: 'Unable to create account'
            })
        }
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            success: false,
            message: 'Account already exist'
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

const login = async (req, res) => {
    try {

        let query = await userModel.findUnique({
            where: {[req.body.field]: req.body.username}
        })
        if (query) {
            let checker = await bcrypt.compare(req.body.password, query.password)
            if (checker) {
                const accessToken = await jwt.sign(
                    {
                        id: query.id
                    },
                    process.env.AUTH_USER_TOKEN,
                    {expiresIn: '2h'}
                )
                res.setHeader('user-authToken', accessToken)
                res.cookie('user-authToken', accessToken, {
                    httpOnly: true,
                    maxAge: 2 * 60 * 60 * 1000,
                    sameSite: 'None'
                })

                return res.status(HttpStatus.OK).json({
                    statusCode: HttpStatus.OK,
                    message: 'Login successful, redirecting now...',
                    success: true,
                    accessToken: accessToken
                })
            }
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Invalid Credentials",
                success: false
            })
        }
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: "Account not found",
            success: false
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
        let query = await bookModel.findMany({
            orderBy: { createdAt: 'ASC' }
        })
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

const getBorrowBooks = async (req, res) => {
    try {
        let query = await bookRequestModel.findMany({
                where: { userId: req.userId },
                include: { book: true }
            })
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            status: true,
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

const getInbox = async (req, res) => {
    try {
        let query = await inboxModel.findMany({
                where: { userId: req.userId },
                include: { book: true }
            })
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.BAD_REQUEST,
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

const getDetails = async (req, res) => {
    try {
        let query = await userModel.findUnique({
            where: { id: req.userId },
        })
        if (query) {
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                success: true,
                message: 'user details fetched',
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
            where: { id: req.params.id }
        })
        if (query) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.OK,
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
            where: { id: req.params.id },
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

        let query = await userModel.findUnique({
            where: { id: req.userId},
        })
        if (query) {
            let checker = await bcrypt.compare(req.body.oldPassword, query.password)
            if (checker) {
                let password = await bcrypt.hash(req.body.password, 10)
                let create = await userModel.update({
                   where: { id: req.userId },
                    data: { password }
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
            message: 'User not found'
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
const orderBook = async (req, res) => {
    try {
        let query = await bookRequestModel.create({
            ...req.body
        })
        if (query) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                success: true,
                message: req.body.status === 0 ? 'Book order request placed successfully' : 'Book reserve request placed successfully'
            })
        }
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            success: false,
            message: 'Unable to  submit book request '
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

const returnBook = async (req, res) => {
    try {
        let query = await bookRequestModel.update({ 
            where: { userId: req.body.userId, bookId: req.body.bookId },
            data: { status: 4 }
        })
        if (query) {
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                success: true,
                message: "Book return request submitted successfully"
            })
        }
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            success: false,
            message: 'Unable to  submit book return request '
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
    register,
    getBooks,
    getDetails,
    getBorrowBooks,
    getInbox,
    getBookDetails,
    getBorrowedBookDetails,
    changePassword,
    orderBook,
    returnBook

}