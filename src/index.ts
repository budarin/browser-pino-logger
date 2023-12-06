import { pino, Level, LogEvent } from 'pino';

const getSend = (endpoint: string) =>
    async function (_: Level, logEvent: LogEvent) {
        return await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([logEvent]),
        });
    };

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

function getLightScheme(defaultScheme: string = 'light'): LightSchemeType {
    const darkMode =
        'matchMedia' in globalThis ? globalThis.matchMedia('(prefers-color-scheme: dark)').matches : defaultScheme;
    return darkMode ? 'dark' : 'light';
}

function getFormatedBindings(
    colorSchema: LightScheme,
    defaultLightSchema: LightSchemeType | undefined,
    bindings: pino.Bindings[],
): string[] {
    const lightScheme = getLightScheme(defaultLightSchema);

    const bindingMessages =
        bindings.length > 0
            ? bindings
                  .map((b) => Object.values(b))
                  .flat()
                  .map((b) => `%c${b}`)
                  .join('')
            : '';
    const bindingStyles =
        bindings.length > 0
            ? bindings
                  .map((b) => Object.values(b))
                  .flat()
                  .map(
                      (b) =>
                          `color: ${
                              colorSchema[b]?.[defaultLightSchema || lightScheme] || 'black'
                          }; font-weight: bold;`,
                  )
            : '';

    return [bindingMessages, ...bindingStyles].filter(Boolean);
}

const { info, warn, error, debug } = console;

const logFunctions = {
    debug,
    info,
    warn,
    error,
};

type LogFunctions = typeof logFunctions;
type KeyOfLogFunctions = keyof LogFunctions;

function logMessage(level: string, binds: string[], messages: string[]): void {
    const logFunction = logFunctions[level as KeyOfLogFunctions];

    if (logFunction) {
        if (binds.length > 0) {
            logFunction(...binds, ...messages);
        } else {
            logFunction(...messages);
        }
    }
}
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
                                await fetch(endpoint, {
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
