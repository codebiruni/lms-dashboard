import { NextResponse } from "next/server";

const BASE_URL = "https://convay.com/services/vcmeetingsettings";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        const res = await fetch(`${BASE_URL}/user/authenticate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        console.log("Raw Convay Response:", data);

        // 🔥 parse string response
        const parsed = JSON.parse(data.data);
        const accessToken = parsed.accessToken;

        if (!accessToken) {
            return NextResponse.json(
                { error: "No access token found" },
                { status: 401 }
            );
        }

        // ✅ create response FIRST
        const response = NextResponse.json({
            success: true,
            message: "Login successful",
        });

        // ✅ set cookie ON RESPONSE
        response.cookies.set("convay_token", accessToken, {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
        });

        return response;

    } catch (error) {
        console.error("Login error:", error);

        return NextResponse.json(
            { error: "Login failed" },
            { status: 500 }
        );
    }
}
