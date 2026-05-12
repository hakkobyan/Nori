This is a [Next.js](https://nextjs.org) app for researching study materials and chatting with an AI tutor.

## Getting Started

1. Add environment variables.

For local development, create `.env.local` with:

```bash
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

If you prefer Vertex AI instead of a Gemini API key, you can use:

```bash
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=global
GEMINI_MODEL=gemini-2.5-flash
```

2. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Vercel Setup

Add these environment variables in your Vercel project:

```bash
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

That is the simplest production setup and does not require Google Cloud runtime credentials.

If you want to use Vertex AI on Vercel instead, you will also need Google Cloud authentication in addition to:

```bash
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=global
GEMINI_MODEL=gemini-2.5-flash
```

## How It Works

- The UI sends chat requests to `app/api/chat/route.js`.
- The route reads server-side environment variables at runtime.
- If `GEMINI_API_KEY` is set, the app uses the Gemini API directly.
- If no API key is set but `GOOGLE_CLOUD_PROJECT` is present, the app falls back to Vertex AI.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
