# browser-pino-logger

A preconfigured Pino logger designed for web applications to facilitate the transmission of logs to a server.

## Installation

```bash
yarn add @budarin/browser-pino-logger
```

## Usage

```ts
import { PinoLogger } from '@budarin/browser-pino-logger';

const appLogger = new PinoLogger('/api', { layer: 'APP' });
appLogger.info('Start Application!');

const domainLogger = appLogger.child({ layer: 'DOMAIN' });
domainLogger.info('Log from Domain!');
```
