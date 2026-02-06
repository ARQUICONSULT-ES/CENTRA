import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { RelationType } from '@/app/generated/prisma/client';

// GET /api/related-links?relationType=Customer&relationId={id}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const relationType = searchParams.get('relationType') as RelationType;
    const relationId = searchParams.get('relationId');

    if (!relationType || !relationId) {
      return NextResponse.json(
        { error: 'relationType and relationId are required' },
        { status: 400 }
      );
    }

    const links = await prisma.relatedLink.findMany({
      where: {
        relationType,
        relationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching related links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related links' },
      { status: 500 }
    );
  }
}

// POST /api/related-links
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { relationType, relationId, name, url, favicon } = body;

    if (!relationType || !relationId || !name || !url) {
      return NextResponse.json(
        { error: 'relationType, relationId, name, and url are required' },
        { status: 400 }
      );
    }

    const link = await prisma.relatedLink.create({
      data: {
        relationType,
        relationId,
        name,
        url,
        favicon: favicon || null,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Error creating related link:', error);
    return NextResponse.json(
      { error: 'Failed to create related link' },
      { status: 500 }
    );
  }
}
