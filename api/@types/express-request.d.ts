export {};

declare global {
  namespace Express {
    interface Request {
      authToken?: string;
    }
  }
}
