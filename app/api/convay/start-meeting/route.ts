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

        // Get the meeting settings from your frontend request
        const body = await req.json();

        const res = await fetch(`${BASE_URL}/api-user/start-meeting`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                meetingType: body.meetingType || "instant",
                title: body.title || "New Meeting",
                preDefineHostEnabled: true,
                uniqueParticipantJoin: true, // CRITICAL: Must be true for unique links 
                config: body.config || {
                    PRTCPNTS_AUD_ENABLED: true,
                    PRTCPNTS_VDO_ENABLED: true,
                    PASSWORD: true,
                    AUTH_USER: false,
                }
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json(data); // Returns { calendarId, startMeetingUrl, etc. } [cite: 50, 57]
    } catch (err) {
        console.error("START MEETING ERROR:", err);
        return NextResponse.json({ error: "Start meeting failed" }, { status: 500 });
    }
}