import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_URL = "https://convay.com/services/vcmeetingsettings";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();

        const token = cookieStore.get("convay_token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "No token found" },
                { status: 401 }
            );
        }

        // GET DATA FROM FRONTEND
        const body = await req.json();

        const res = await fetch(
            `${BASE_URL}/api-user/schedule-meeting`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                    meeting_title: body.meeting_title,

                    start_time: body.start_time,

                    end_time: body.end_time,

                    timezone: body.timezone || "Asia/Dhaka",

                    meeting_description:
                        body.meeting_description ||

                        "Scheduled LMS Class",

                    bigMeeting: false,
                }),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(data, {
                status: res.status,
            });
        }

        return NextResponse.json(data);
    } catch (err) {
        console.log("SCHEDULE MEETING ERROR:", err);

        return NextResponse.json(
            { error: "Failed to schedule meeting" },
            { status: 500 }
        );
    }
}