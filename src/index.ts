import { pino, Level, LogEvent } from 'pino';

const noop = (): void => {};

interface LoggerService {
    info: (...data: unknown[]) => void;
    warn: (...data: unknown[]) => void;
    error: (...data: unknown[]) => void;
    debug: (...data: unknown[]) => void;
    child: (binding: Record<string, string>) => LoggerService;
}

export type LightSchemeType = 'light' | 'dark';
export type LightScheme = {
    [key: string]: {
        light: string;
        dark: string;
    };
};

export class PinoLogger implements LoggerService {
    private endpoint: string;

    private pinoInstance: pino.Logger;

    constructor(
        endpoint: string,
        bindings: Record<string, string> = {},
        pinoInstance: pino.Logger | undefined = undefined,
    ) {
        this.endpoint = endpoint;

        this.pinoInstance =
            pinoInstance ||
            pino({
                formatters: {
                    level: (label) => ({ level: label.toUpperCase() }),
                },
                browser: {
                    serialize: false,
                    asObject: false,
                    transmit: {
                        send: async (level: Level, logEvent: LogEvent): Promise<void> => {
                            const pinoInstanceLevel = pino.levels.values[this.pinoInstance.level];

                            if (pino.levels.values[level] >= pinoInstanceLevel) {
                                await fetch(`${endpoint}/${level}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json; charset=utf-8',
                                    },
                                    body: JSON.stringify([logEvent]),
                                });
                            }
                        },
                    },
                    write: noop,
                },
            }).child(bindings);
    }

    info(...data: unknown[]): void {
        this.pinoInstance.info(data);
    }

    warn(...data: unknown[]): void {
        this.pinoInstance.warn(data);
    }

    error(...data: unknown[]): void {
        this.pinoInstance.error(data);
    }

    debug(...data: unknown[]): void {
        this.pinoInstance.debug(data);
    }

    child(bindings: Record<string, string>): LoggerService {
        const childLogger = this.pinoInstance.child(bindings);

        return new PinoLogger(this.endpoint, bindings, childLogger);
    }
}
