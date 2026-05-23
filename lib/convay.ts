"use server";

import { cookies } from "next/headers";

const BASE_URL = "https://convay.com/services/vcmeetingsettings";

const getToken = async () => {
    const cookieStore = await cookies();
    return cookieStore.get("convay_token")?.value;
};

export const loginConvay = async (username: string, password: string) => {
    const res = await fetch(`${BASE_URL}/user/authenticate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data?.data?.accessToken) {
        (await cookies()).set("convay_token", data.data.accessToken);
    }

    return data;
};

export const startMeeting = async (title: string) => {
    const token = getToken();

    const res = await fetch(`${BASE_URL}/api-user/start-meeting`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            meetingType: "instant",
            title,
            preDefineHostEnabled: true,
            uniqueParticipantJoin: true,
            config: {
                PRTCPNTS_AUD_ENABLED: true,
                PRTCPNTS_VDO_ENABLED: false,
                PASSWORD: true,
                AUTH_USER: false,
                PRTCPNTS_CHAT_CTRL: true,
            },
        }),
    });

    return res.json();
};

export const generateJoinUrls = async (
    meetingId: string,
    users: { userId: string; name: string }[]
) => {
    const token = getToken();

    const res = await fetch(
        `${BASE_URL}/meeting/calender/generate-join-urls`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                meetingId,
                participants: users,
            }),
        }
    );

    return res.json();
};

export const scheduleMeeting = async () => {
    const token = getToken();

    const now = Date.now();
    const later = now + 60 * 60 * 1000;

    const res = await fetch(`${BASE_URL}/api-user/schedule-meeting`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            meeting_title: "Test Scheduled Meeting",
            start_time: now,
            end_time: later,
            timezone: "Asia/Dhaka",
            meeting_description: "Test meeting",
        }),
    });

    return res.json();
};

export const endMeeting = async (uniqueId: string) => {
    const token = getToken();

    const res = await fetch(
        `${BASE_URL}/api-user/end-meeting-by-unique-id?uniqueId=${uniqueId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return res.json();
};


