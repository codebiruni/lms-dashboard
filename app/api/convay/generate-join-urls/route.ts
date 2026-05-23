import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_URL = "https://convay.com/services/vcmeetingsettings";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("convay_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "No token found" }, { status: 401 });
        }

        const body = await req.json();
        console.log(body);

        // Validate that we have the meeting ID and participants
        if (!body.meeting_id) {
            return NextResponse.json({ error: "Missing meeting ID" }, { status: 400 });
        }

        const res = await fetch(
            `${BASE_URL}/meeting/calender/generate-join-urls`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "meeting_id": body.meeting_id, // DOC REQUIREMENT: Must use underscore 
                    "hosts": body.hosts || [],
                    "participants": body.participants || [] // Array of {userId, name} 
                })
            }
        );

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json(data); // Returns an array of { userId, joinUrl } 
    } catch (error) {
        console.error("GENERATE JOIN URL ERROR:", error);
        return NextResponse.json({ error: "Failed to generate join URLs" }, { status: 500 });
    }
}