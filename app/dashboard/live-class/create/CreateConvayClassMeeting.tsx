"use client";

import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CreateConvayClassMeeting({ onCreated }: any) {
  const [loading, setLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [meeting, setMeeting] = useState<{
    calendarId: string;
    startMeetingUrl: string;
  } | null>(null);

  // ── Step 0: Login 
  const handleLogin = async () => {
    const res = await fetch("/api/convay/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        username: "codebiruny@gmail.com",
        password: "Codebiruni2015*",
      }),
    });
    const data = await res.json();
    console.log("Login response:", data);
    alert(res.ok ? "✅ Logged in" : `Login failed: ${JSON.stringify(data)}`);
  };

  const handleCreateMeeting = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/convay/start-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       
        body: JSON.stringify({
          meetingType: "instant",
          title: "Live Class Meeting",
          preDefineHostEnabled: false,
          uniqueParticipantJoin: true, // CRITICAL for unique links 
          config: {
            PRTCPNTS_AUD_ENABLED: true,
            PRTCPNTS_VDO_ENABLED: true,
            PASSWORD: true,
            AUTH_USER: false,
          }
        }),
        credentials: "include",
      });

      const data = await res.json();
      console.log("Start-meeting full response:", data);

      // The API returns 'calendarId' and 'startMeetingUrl' [cite: 57, 209]
      const calendarId = data?.calendarId;
      const startMeetingUrl = data?.startMeetingUrl;

      if (!calendarId) {
        alert(`No calendarId in response.\nSee console for details.`);
        return;
      }

      setMeeting({ calendarId, startMeetingUrl });
      alert(`Meeting created!\nCalendar ID: ${calendarId}`);

    } catch (err) {
      console.error(err);
      alert("Error creating meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateJoinLink = async () => {
    if (!meeting) {
      alert("Create a meeting first!");
      return;
    }

    try {
      setJoinLoading(true);

      // Updated payload to match the documentation table 
      const payload = {
        meeting_id: meeting.calendarId, // Required: Use underscore 
        hosts: [
          {
            user_id: "teacher@gmail.com", // Required: Use underscore [cite: 64]
            name: "Teacher",
          },
        ],
        participants: [
          {
            user_id: "student-001", // Required: Use underscore [cite: 65]
            name: "Rifat",
          },
        ],
      };

      console.log("generate-join-urls payload:", payload);

      const joinRes = await fetch("/api/convay/generate-join-urls", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const joinData = await joinRes.json();
      console.log("generate-join-urls full response:", joinData);

      if (!joinRes.ok || joinData?.error) {
        alert(`Join URL error:\n${JSON.stringify(joinData, null, 2)}`);
        return;
      }

      // The response is an ARRAY of objects 
      // Find the participant link (student-001)
      const studentObj = joinData.find((item: { userId: string; }) => item.userId === "student-001");
      const studentUrl = studentObj?.joinUrl;

      if (studentUrl) {
        onCreated({
          hostUrl: meeting.startMeetingUrl,
          meetingId: meeting.calendarId,
          studentUrl,
        });
        alert(`Done!\nStudent URL: ${studentUrl}`);
      } else {
        alert("Could not find student link in response.");
      }

    } catch (err) {
      console.error(err);
      alert("Error generating join link");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleScheduleMeeting = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/convay/schedule-meeting",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            meeting_title: "DBMS Live Class",

            start_time: "1779739200000",

            end_time: "1779742800000",

            timezone: "Asia/Dhaka",

            meeting_description: "Weekly DBMS Live Class",

            bigMeeting: true,
          })
        }
      );

      const data = await res.json();

      console.log(data);

      alert("Meeting Scheduled Successfully");
    } catch (error) {
      console.log(error);

      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 340 }}>

      {/* Login */}
      <button onClick={handleLogin} style={btn("#444")}>
        🔐 Login Convay
      </button>

      {/* Step 1 */}
      <button onClick={handleCreateMeeting} disabled={loading} style={btn("#1a56db", loading)}>
        {loading ? "Creating..." : "① Create Meeting"}
      </button>

      {/* Step 1 result */}
      {meeting && (
        <div style={card}>
          <b>✅ Meeting Ready</b>
          <br />
          <small>ID: <code>{meeting.calendarId}</code></small>
        </div>
      )}

      {/* Step 2 — only active after meeting exists */}
      <button
        onClick={handleGenerateJoinLink}
        disabled={joinLoading || !meeting}
        style={btn("#0e9f6e", joinLoading || !meeting)}
      >
        {joinLoading ? "Generating..." : "② Generate Join Link"}
      </button>

      <button
        onClick={handleScheduleMeeting}
        className="bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Schedule Meeting
      </button>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────
const btn = (color: string, disabled = false): React.CSSProperties => ({
  background: disabled ? "#555" : color,
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 6,
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.65 : 1,
  fontWeight: 600,
});

const card: React.CSSProperties = {
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: 6,
  padding: "8px 12px",
  fontSize: 13,
  color: "#166534",
  wordBreak: "break-all",
};