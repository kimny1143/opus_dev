import { NextRequest, NextResponse } from 'next/server';

export const appHandler = async (req: NextRequest, res: any, parsedUrl: any) => {
  try {
    const response = NextResponse.json({ message: 'Success' }, { status: 200 });
    res.statusCode = response.status;
    
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });
    
    if (response.body) {
      const reader = response.body.getReader();
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(value);
        return pump();
      };
      await pump();
    } else {
      res.end();
    }
  } catch (error) {
    console.error('appHandler エラー:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};