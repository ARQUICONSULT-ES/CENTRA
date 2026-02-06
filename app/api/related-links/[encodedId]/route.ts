import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { RelationType } from '@/app/generated/prisma/client';

// PUT /api/related-links/[encodedId] - Update a link
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ encodedId: string }> }
) {
  try {
    const { encodedId } = await params;
    const body = await request.json();
    const { name, url, favicon, originalUrl } = body;

    // Decode the composite key from base64
    const decoded = Buffer.from(encodedId, 'base64').toString('utf-8');
    const [relationType, relationId, origUrl] = decoded.split('|');

    if (!name || !url) {
      return NextResponse.json(
        { error: 'name and url are required' },
        { status: 400 }
      );
    }

    // If URL changed, we need to delete the old one and create a new one
    // because URL is part of the primary key
    if (originalUrl && originalUrl !== url) {
      await prisma.relatedLink.delete({
        where: {
          relationType_relationId_url: {
            relationType: relationType as RelationType,
            relationId,
            url: originalUrl,
          },
        },
      });

      const newLink = await prisma.relatedLink.create({
        data: {
          relationType: relationType as RelationType,
          relationId,
          name,
          url,
          favicon: favicon || null,
        },
      });

      return NextResponse.json(newLink);
    }

    // If URL didn't change, just update the other fields
    const link = await prisma.relatedLink.update({
      where: {
        relationType_relationId_url: {
          relationType: relationType as RelationType,
          relationId,
          url: origUrl,
        },
      },
      data: {
        name,
        favicon: favicon || null,
      },
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error('Error updating related link:', error);
    return NextResponse.json(
      { error: 'Failed to update related link' },
      { status: 500 }
    );
  }
}

// DELETE /api/related-links/[encodedId] - Delete a link
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ encodedId: string }> }
) {
  try {
    const { encodedId } = await params;

    // Decode the composite key from base64
    const decoded = Buffer.from(encodedId, 'base64').toString('utf-8');
    const [relationType, relationId, url] = decoded.split('|');

    await prisma.relatedLink.delete({
      where: {
        relationType_relationId_url: {
          relationType: relationType as RelationType,
          relationId,
          url,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting related link:', error);
    return NextResponse.json(
      { error: 'Failed to delete related link' },
      { status: 500 }
    );
  }
}
