"use client";

import { useState } from "react";
import CreateConvayClassMeeting from "./CreateConvayClassMeeting";

export default function CreateLiveClass() {
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingId, setMeetingId] = useState("");

  return (
    <div>
      <h2>Create Live Class</h2>

      {/* Meeting Platform */}
      <div>
        <label>Meeting Platform</label>
        <select>
          <option>Convay</option>
        </select>
      </div>

      {/* Meeting Link Section */}
      <div style={{ marginTop: 20 }}>
        <label>Meeting Link</label>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={meetingLink || ""}
            readOnly
            placeholder="No meeting link added yet"
            style={{ flex: 1, padding: 10 }}
          />

          <CreateConvayClassMeeting
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onCreated={(data: any) => {
              setMeetingLink(data.meetingUrl);
              setMeetingId(data.meetingId);

              // optional: auto open host
              window.open(data.hostUrl, "_blank");
            }}
          />
        </div>
      </div>

      {/* DEBUG INFO (remove later) */}
      {meetingId && (
        <p style={{ marginTop: 10 }}>
          Meeting ID: {meetingId}
        </p>
      )}

      {/* Submit Button */}
      <button style={{ marginTop: 20 }}>
        Create Live Class
      </button>
    </div>
  );
}