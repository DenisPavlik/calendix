import { connectToDB } from "@/libs/connectToDB";
import { getSessionEmailFromRequest } from "@/libs/getSessionEmail";
import { EventTypeModel } from "@/models/EventType";
import { NextRequest } from "next/server";

function uriFromTitle(title: string): string {
  return title.toLowerCase().replaceAll(/[^a-z0-9]/g, "-");
}

export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    const email = await getSessionEmailFromRequest(req);
    if (!email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const title = url.searchParams.get("checkTitle");
    const excludeId = url.searchParams.get("excludeId");

    if (!title) {
      return new Response("Missing checkTitle", { status: 400 });
    }

    const uri = uriFromTitle(title);
    const query: Record<string, unknown> = { email, uri };
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await EventTypeModel.findOne(query);
    return Response.json({ available: !existing });
  } catch (err) {
    console.error("Error in GET /event-types", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const email = await getSessionEmailFromRequest(req);
    if (!email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    data.uri = uriFromTitle(data.title);

    const eventTypeDoc = await EventTypeModel.create({ email, ...data });
    return Response.json(eventTypeDoc);
  } catch (err: unknown) {
    if ((err as { code?: number })?.code === 11000) {
      return new Response("An event type with this name already exists", { status: 409 });
    }
    console.error("Error in POST /event-types", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDB();
    const email = await getSessionEmailFromRequest(req);
    if (!email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    data.uri = uriFromTitle(data.title);
    const id = data.id;

    if (id) {
      await EventTypeModel.updateOne({ email, _id: id }, data);
      return Response.json({ success: true });
    }
    return new Response("Missing ID", { status: 400 });
  } catch (err: unknown) {
    if ((err as { code?: number })?.code === 11000) {
      return new Response("An event type with this name already exists", { status: 409 });
    }
    console.error("Error in PUT /event-types", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDB();
    const email = await getSessionEmailFromRequest(req);
    if (!email) {
      return new Response("Unauthorized", { status: 401 });
    }
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      await EventTypeModel.deleteOne({ _id: id, email });
      return Response.json({ success: true });
    }
    return new Response("Missing ID", { status: 400 });
  } catch (err) {
    console.error("Error in DELETE /api/event-types:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
