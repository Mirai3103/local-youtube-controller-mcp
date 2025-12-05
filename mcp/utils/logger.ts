import fs from 'fs';
import { config } from '../config';

class Logger {
  private stream: fs.WriteStream;

  constructor() {
    this.stream = fs.createWriteStream(config.logFile, { flags: 'a' });
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}\n`;
  }

  info(message: string): void {
    this.stream.write(this.formatMessage('INFO', message));
  }

  error(message: string): void {
    this.stream.write(this.formatMessage('ERROR', message));
  }

  warn(message: string): void {
    this.stream.write(this.formatMessage('WARN', message));
  }

  debug(message: string): void {
    this.stream.write(this.formatMessage('DEBUG', message));
  }
}

export const logger = new Logger();

