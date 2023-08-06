const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

//link dotenv
dotenv.config({ path: path.join(__dirname, '../../.env') });

//env validation sequence
const envValidation = Joi.object()
    .keys({
        LOG_FOLDER: Joi.string().required(),
        LOG_FILE: Joi.string().required(),
        LOG_LEVEL: Joi.string().required(),
    })
    .unknown();

const { value: envVar, error } = envValidation
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
    logConfig: {
        logFolder: envVar.LOG_FOLDER,
        logFile: envVar.LOG_FILE,
        logLevel: envVar.LOG_LEVEL,
    }
};
