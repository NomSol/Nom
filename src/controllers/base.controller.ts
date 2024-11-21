import { NextResponse } from 'next/server';

export class BaseController {
  protected success<T>(data: T, status: number = 200) {
    return NextResponse.json(data, { status });
  }

  protected error(message: string, status: number = 400) {
    return NextResponse.json(
      { error: message },
      { status }
    );
  }

  protected unauthorized(message: string = 'Unauthorized') {
    return this.error(message, 401);
  }
}