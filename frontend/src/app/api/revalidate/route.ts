// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * ISR On-Demand Revalidation API Route
 * Reference: T143 (Setup on-demand ISR revalidation endpoint)
 *
 * Called by backend webhook when CMS content is updated
 * Revalidates specific paths to trigger ISR regeneration
 */

import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify secret token
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get('secret');
    const path = searchParams.get('path');

    // Check secret
    const expectedSecret = process.env.REVALIDATION_SECRET || 'default-secret-change-in-production';
    if (secret !== expectedSecret) {
      return NextResponse.json(
        {
          error: 'Invalid secret',
          message: 'Unauthorized: Invalid revalidation secret'
        },
        { status: 401 }
      );
    }

    // Check path parameter
    if (!path) {
      return NextResponse.json(
        {
          error: 'Missing path',
          message: 'Path parameter is required'
        },
        { status: 400 }
      );
    }

    // Revalidate the specified path
    revalidatePath(path);

    // Also revalidate the home page if content was updated
    revalidatePath('/');
    revalidatePath('/it');
    revalidatePath('/he');

    return NextResponse.json({
      revalidated: true,
      path,
      now: Date.now(),
      message: `Successfully revalidated: ${path}`,
    });

  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      {
        error: 'Revalidation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Support GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Revalidation endpoint is active. Use POST method with secret and path parameters.',
    example: '/api/revalidate?secret=YOUR_SECRET&path=/it/products/slug',
  });
}
