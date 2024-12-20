import { NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: '1mb',
  },
};

export function withConfig(handler: Function) {
  return async function (req: Request, ...args: any[]) {
    try {
      const response = await handler(req, ...args);
      
      // 设置响应头
      const headers = new Headers(response.headers);
      headers.set('Content-Length', String(response.body?.length || 0));
      
      return new NextResponse(response.body, {
        status: response.status,
        headers,
      });
    } catch (error) {
      console.error('API Error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Internal Server Error' }),
        { status: 500 }
      );
    }
  };
}
