module.exports = {
    NextRequest: class {},
    NextResponse: {
      redirect: jest.fn(),
      json: jest.fn(),
    },
  };