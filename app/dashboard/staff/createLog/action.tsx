import { createClient } from "@/lib/supabase/server";


export async function createLog(log: Log) {
    const supabase = await createClient();

    const { error } = await supabase.from("Logs").insert([
        {creator: log.creator,
        created_at: log.dateCreated, 
        start_date: log.startDateTime, 
        end_date: log.endDateTime,
        logNote: log.note,
        location: log.location,
        videos: log.videos,
        photos: log.photos,
        client_id: log.creator,
        }, 
    ])
}