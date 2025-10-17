# browser-pino-logger

A preconfigured Pino logger designed for web applications to facilitate the transmission of logs to a server.

## Installation

```bash
npm install @budarin/browser-pino-logger
# or
yarn add @budarin/browser-pino-logger
# or
pnpm add @budarin/browser-pino-logger
```

## Usage

```ts
import { uuidv7 } from 'uuidv7';
import { PinoLogger } from '@budarin/browser-pino-logger';

// Initialize logger with endpoint and UUID generator
const appLogger = new PinoLogger('/api/logs', uuidv7, { layer: 'APP' });

// Set log level (optional, defaults to 'info')
appLogger.setLevel('debug');

// Log messages
appLogger.info('Start Application!');
appLogger.warn('Warning message');
appLogger.error('Error occurred');
appLogger.debug('Debug information');

// Create child logger with additional bindings
const domainLogger = appLogger.child({ layer: 'DOMAIN' });
domainLogger.info('Log from Domain!');
```

## API

### Constructor

```ts
new PinoLogger(
    endpoint: string,
    uuidGenerator: () => string,
    bindings?: Record<string, string>,
    pinoInstance?: pino.Logger
)
```

- `endpoint`: The server endpoint where logs will be sent
- `uuidGenerator`: Function that generates unique identifiers for log entries
- `bindings`: Optional initial bindings for the logger
- `pinoInstance`: Optional custom Pino logger instance (for advanced usage)

### Methods

- `info(...data: unknown[])`: Log info level messages
- `warn(...data: unknown[])`: Log warning level messages
- `error(...data: unknown[])`: Log error level messages
- `debug(...data: unknown[])`: Log debug level messages
- `setLevel(level: pino.Level)`: Set the minimum log level
- `child(bindings: Record<string, string>)`: Create a child logger with additional bindings

## Features

- Automatic log transmission to server via HTTP POST requests
- Configurable log levels
- Child logger support for structured logging
- Browser-optimized Pino configuration
- TypeScript support

## License

MIT
