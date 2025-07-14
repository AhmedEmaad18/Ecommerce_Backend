const {createLogger,format,transports} =require('winston');
const logger = createLogger({
    level:process.env.NODE_ENV==='production'?'info':'debug',
    format:format.combine(
        format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),  
        format.errors({ stack: true }),
        format.printf(({ timestamp, level, message, stack }) => {
            let logMessage = `${timestamp}| ${level.toUpperCase()}| ${message}`;
            if (stack) {
                logMessage += `\n${stack}`;
            }
            return logMessage;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/error.log' ,level:'error'}),
         new transports.File({ filename: 'logs/combined.log' })

    ],
    exceptionHandlers: [
        new transports.File({ filename: 'exceptions.log' })
    ]
})
module.exports=logger;