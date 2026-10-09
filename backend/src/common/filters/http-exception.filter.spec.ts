import {
  BadRequestException,
  Logger,
  NotFoundException,
  type ArgumentsHost,
} from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter.js';

function hostWithResponse() {
  const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
  return { host, response };
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  it('keeps validation messages as an array', () => {
    const { host, response } = hostWithResponse();
    filter.catch(
      new BadRequestException(['dueDate must be on or after invoiceDate']),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: ['dueDate must be on or after invoiceDate'],
      error: 'Bad Request',
    });
  });

  it('formats a 404', () => {
    const { host, response } = hostWithResponse();
    filter.catch(new NotFoundException('Invoice not found'), host);

    expect(response.json).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Invoice not found',
      error: 'Not Found',
    });
  });

  it('hides details of unexpected errors', () => {
    const { host, response } = hostWithResponse();
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    filter.catch(new Error('relation "invoices" does not exist'), host);

    expect(response.status).toHaveBeenCalledWith(500);
    const body = response.json.mock.calls[0][0] as { message: string };
    expect(body.message).not.toContain('relation');
  });
});
