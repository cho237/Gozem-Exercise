import * as winston from 'winston';
const {combine, timestamp, json, prettyPrint, errors} = winston.format;

const  logger:winston.Logger = winston.createLogger(
    {
        level: 'info',
        format: combine(
            errors({stack: true}),
            timestamp(),
            json(),
            prettyPrint()
        ),
        transports: [
            new winston.transports.File({filename: 'app.log'})
        ]
    }
)

export default logger