"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type LogFormProps = {
  clientName: string; // Optional client name to include in report
  clientID: string
  userName: string
};

interface Log{
    creator: string;
    dateCreated: Date;
    startDateTime: string;
    endDateTime: string;
    note: string;
    location?: string;
    videos?: string[];
    photos?: string[];
}

export default function LogForm({ clientName, clientID, userName }: LogFormProps) {
  //const [log, setLog] = useState<Log>();
  const [log, setLog] = useState<Log>({
    creator: userName,
    dateCreated: new Date(),
    startDateTime: "",
    endDateTime: "",
    note: "",
    location: "",
    videos: [""],
    photos: [""],
  });

  // Format the log title from creator and created_at
  const formatLogTitle = () => {
    const formattedDate =  log.dateCreated.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${formattedDate} - ${userName}`;
  };

  const updateLog = (document: Document) => {
    log.startDateTime = (document.getElementById('startDateTime') as HTMLInputElement).value;
    log.endDateTime = (document.getElementById('endDateTime') as HTMLInputElement).value;
    log.note = (document.getElementById('note') as HTMLInputElement).value; 
    log.location = (document.getElementById('location') as HTMLInputElement).value;
    log.videos = [(document.getElementById('videos') as HTMLInputElement).value];
    log.photos = [(document.getElementById('photos') as HTMLInputElement).value];
    return formatLogTitle;
  }

// actual create log page
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Create Log</h2>
      <div className="space-y-2">
          <div>
            <form id="logForm">
                <label htmlFor="startDateTime">
                    Start Date and Time: 
                </label>
                <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    required
                />

                <label htmlFor="endDateTime">
                    End Date and Time: 
                </label>
                <input
                    id="endDateTime"
                    name="endDateTime"
                    type="date"
                    required
                />

                <label htmlFor="note">
                    Notes to submit: 
                </label>
                <input
                    id="endDateTime"
                    name="endDateTime"
                    type="text"
                />

                <label htmlFor="location">
                    Location to add to note: 
                </label>
                <input
                    id="location"
                    name="location"
                    type="text"
                />

                <label htmlFor="videos">
                    Videos to add to note: 
                </label>
                <input
                    id="videos"
                    name="videos"
                    type="text"
                />

                <label htmlFor="photos">
                    Photos to add to note: 
                </label>
                <input
                    id="photos"
                    name="photos"
                    type="text"
                />
            </form>
            
            <div>
              <Button 
              onClick={updateLog(document)}
              className="bg-blue-600 hover:bg-blue-700"
              >
                  Save Log
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}